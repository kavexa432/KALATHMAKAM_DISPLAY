import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  collection,
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../../config/firebase';
import { cleanVenueName } from '../../utils/venueUtils';

import type {
  FestivalEdition,
  HouseModel,
  HouseId,
  StageModel,
  EventModel,
  EventResultModel,
  LiveActivityFeedItem,
  AuditLogItem,
  UserModel,
  GalleryItemModel,
  LeaderboardDay,
  AnnouncementType,
  PriorityLevel,
  ResultDraftModel,
} from '../types/festivalTypes';
import {
  currentFestival,
  initialHouses,
  initialStages,
  initialResults,
  initialLiveFeed,
  initialAuditLogs,
  initialUsers,
  initialGallery,
  initialEvents,
  houseEvents,
} from '../data/festivalData';

interface FestivalContextType {
  festival: FestivalEdition;
  houses: HouseModel[];
  stages: StageModel[];
  events: EventModel[];
  results: EventResultModel[];
  resultDrafts: ResultDraftModel[];
  liveFeed: LiveActivityFeedItem[];
  auditLogs: AuditLogItem[];
  users: UserModel[];
  gallery: GalleryItemModel[];
  currentUser: UserModel | null;
  firebaseAuthUser: FirebaseUser | null;
  archiveMode: boolean;
  
  // Computed Engine Functions
  getHousePoints: (houseId: HouseId, day?: LeaderboardDay) => number;
  getHouseRank: (houseId: HouseId) => number;
  getHouseMedals: (houseId: HouseId) => { gold: number; silver: number; bronze: number; total: number };
  
  // Workflow Actions
  delayEvent: (eventId: string, minutes: number) => Promise<void>;
  addEvent: (eventName: string, category: string, catLevel: string) => Promise<void>;
  login: (role: 'developer' | 'admin' | 'user') => void;
  loginWithGoogle: () => Promise<'signed-in' | 'redirecting'>;
  loginCustomUser: (email: string) => void;
  logout: () => Promise<void>;
  submitResult: (newResult: Omit<EventResultModel, 'id' | 'createdAt' | 'status'>) => void;
  verifyResult: (resultId: string) => void;
  publishResult: (resultId: string) => void;
  deleteResult: (resultId: string) => Promise<void>;
  cleanupConflictingEvents: () => Promise<void>;
  publishEventWinners: (
    eventId: string,
    judgeNotes: string,
    winners: Array<{
      position: '1st' | '2nd' | '3rd';
      studentName: string;
      studentClass: string;
      houseId: HouseId;
      points: number;
    }>
  ) => Promise<void>;
  addAnnouncement: (content: string, type: AnnouncementType, priority: PriorityLevel, houseId?: HouseId, points?: number) => void;
  deleteAnnouncement: (feedId: string) => void;
  togglePermission: (userId: string, permission: string) => void;
  setUserRole: (userId: string, targetRole: 'developer' | 'admin' | 'user') => void;
  toggleAdminAccess: (userId: string) => void;
  createAdminUser: (name: string, email: string) => void;
  removeUser: (userId: string) => void;
  toggleArchiveMode: () => void;
  markFeedRead: () => void;
}

const FestivalContext = createContext<FestivalContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'kalathmakam_current_user_v1';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const normalizePositionLabel = (position: number | string): '1st' | '2nd' | '3rd' | string => {
  const pos = Number(position);
  if (pos === 1) return '1st';
  if (pos === 2) return '2nd';
  if (pos === 3) return '3rd';
  return String(position);
};

const isPublishedResultRecord = (record: any) => {
  const status = String(record?.status || '').toLowerCase();
  return record?.published === true || status === 'published' || status === 'verified';
};

const sortByCreatedAtDesc = <T extends { timestamp?: string; createdAt?: string }>(items: T[]) =>
  [...items].sort((a, b) => {
    const timeA = new Date(a.createdAt || a.timestamp || '').getTime();
    const timeB = new Date(b.createdAt || b.timestamp || '').getTime();
    return (timeB || 0) - (timeA || 0);
  });

const getOperationalEventFields = (event: Partial<EventModel>) =>
  Object.fromEntries(
    Object.entries({
      eventName: event.eventName,
      category: event.category,
      type: event.type,
      language: event.language,
      department: event.department,
      stage: event.stage,
      venue: event.venue,
      date: event.date,
      scheduledStartTime: event.scheduledStartTime,
      scheduledEndTime: event.scheduledEndTime,
      durationMinutes: event.durationMinutes,
      publishToWebsite: event.publishToWebsite,
      participantsExpected: event.participantsExpected,
      houseWise: event.houseWise,
      competitionType: event.competitionType,
      teamSize: event.teamSize,
      participantsPerHouse: event.participantsPerHouse,
      status: event.status,
      delayMinutes: event.delayMinutes,
      actualStartTime: event.actualStartTime,
      actualEndTime: event.actualEndTime,
      cancelled: event.cancelled,
      postponed: event.postponed,
      participantsActual: event.participantsActual,
      resultId: event.resultId,
      winnerHouse: event.winnerHouse,
      updatedAt: event.updatedAt,
    }).filter(([, value]) => value !== undefined)
  );

export const FestivalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [festival] = useState<FestivalEdition>(currentFestival);
  const [houses, setHouses] = useState<HouseModel[]>(initialHouses);
  const [stages, setStages] = useState<StageModel[]>(initialStages);
  const [events, setEvents] = useState<EventModel[]>([]);
  const [results, setResults] = useState<EventResultModel[]>(initialResults);
  const [resultDrafts, setResultDrafts] = useState<ResultDraftModel[]>([]);
  const [liveFeed, setLiveFeed] = useState<LiveActivityFeedItem[]>(initialLiveFeed);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(initialAuditLogs);
  const [users, setUsers] = useState<UserModel[]>(initialUsers);
  const [gallery, setGallery] = useState<GalleryItemModel[]>(initialGallery);
  const publishedResultEventIdsRef = useRef<Set<string>>(new Set());

  const applyPublishedResultsToEvents = (publishedResults: EventResultModel[]) => {
    const publishedEventIds = new Set(
      publishedResults
        .filter((result) => result.status === 'Published' || result.status === 'Verified')
        .map((result) => result.eventId)
    );
    publishedResultEventIdsRef.current = publishedEventIds;

    setEvents((prev) =>
      prev.map((event) =>
        publishedEventIds.has(event.id)
          ? {
              ...event,
              resultsPublished: true,
              winnerUploaded: true,
              housePointsUpdated: true,
            }
          : {
              ...event,
              resultsPublished: false,
              winnerUploaded: false,
              housePointsUpdated: false,
            }
      )
    );
  };
  
  // Keep backend awake ping
  useEffect(() => {
    // Ping every 20 seconds (20000ms)
    const interval = setInterval(() => {
      fetch(`${API_URL}/api/ping`).catch(() => {
        // Silently ignore ping failures
      });
    }, 20000);

    return () => clearInterval(interval);
  }, []);
  
  // 0ms Hydration from LocalStorage Cache
  const [currentUser, setCurrentUser] = useState<UserModel | null>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_USER_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [firebaseAuthUser, setFirebaseAuthUser] = useState<FirebaseUser | null>(null);
  const [archiveMode, setArchiveMode] = useState<boolean>(false);
  const [tick, setTick] = useState(0);

  // Auto-refresh computed statuses every minute
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const computeDynamicEventStatus = (e: EventModel) => {
    if (e.cancelled) return 'Cancelled';
    if (e.resultsPublished || e.status === 'Completed') return 'Completed';

    const now = new Date();
    
    const startTimeParts = (e.scheduledStartTime || '00:00').split(':');
    let startTime = new Date(e.date);
    if (isNaN(startTime.getTime())) {
      startTime = new Date();
    }
    startTime.setHours(parseInt(startTimeParts[0] || '0'), parseInt(startTimeParts[1] || '0'), 0, 0);
    
    if (e.delayMinutes) {
      startTime = new Date(startTime.getTime() + e.delayMinutes * 60000);
    }

    const duration = e.durationMinutes || 60;
    const endTime = new Date(startTime.getTime() + duration * 60000);

    if (now < startTime) {
      return 'Upcoming';
    } else if (now >= startTime && now <= endTime) {
      return 'Running';
    } else {
      return 'Results Pending';
    }
  };

  const computedEvents = React.useMemo(() => {
    return events.map(e => ({
      ...e,
      status: computeDynamicEventStatus(e)
    }));
  }, [events, tick]);

  // Helper to persist user state & update user registry list
  const persistUser = (user: UserModel | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
      // Upsert into users array list immediately so it displays in User Management table
      setUsers((prev) => {
        const exists = prev.some((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
        if (exists) {
          return prev.map((u) => (u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase() ? { ...u, ...user } : u));
        }
        return [user, ...prev];
      });
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
  };

  // Synchronize User Record to Cloud Firestore Database (users/{uid})
  // Always called in background — must never self-promote roles.
  // Role assignment is ONLY done server-side via /api/auth/grant-role (developer only).
  const syncUserToFirestore = async (userRecord: UserModel) => {
    try {
      const userRef = doc(db, 'users', userRecord.id);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        // User already exists — respect whatever role the developer pre-authorized
        const firestoreData = snap.data() as UserModel;
        // Use the Firestore role if it's admin (developer pre-authorized before login)
        // but never downgrade a developer claim
        const currentRole = userRecord.role?.toLowerCase() as 'developer' | 'admin' | 'user';
        const firestoreRole = (firestoreData.role || 'user').toLowerCase() as 'developer' | 'admin' | 'user';

        let finalRole: 'developer' | 'admin' | 'user' = currentRole;
        if (currentRole !== 'developer' && (firestoreRole === 'admin' || firestoreRole === 'developer')) {
          // Firestore has a pre-authorized role — use it (developer granted this before login)
          finalRole = firestoreRole === 'developer' ? 'developer' : 'admin';
        }

        const mergedUser: UserModel = {
          ...firestoreData,
          id: userRecord.id,
          name: userRecord.name || firestoreData.name,
          avatarUrl: userRecord.avatarUrl || firestoreData.avatarUrl,
          role: finalRole,
          approved: finalRole !== 'user',
        };
        persistUser(mergedUser);
        // Update the Firestore record with latest name/avatar
        setDoc(userRef, { name: mergedUser.name, avatarUrl: mergedUser.avatarUrl, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
        return;
      }

      // New user — always write role: 'user'. Role can only be elevated by the developer via backend.
      const newUser: UserModel = {
        ...userRecord,
        role: 'user',
        approved: false,
        permissions: [],
      };
      await setDoc(userRef, newUser);
    } catch (err) {
      console.warn('Firestore Sync Notice:', err);
    }
  };

  // Helper to resolve role STRICTLY from custom claims — never from email on the frontend.
  // The backend (verifyDeveloper middleware) handles the one-time bootstrap of the developer claim.
  const resolveUserRole = (_email: string, claimRole?: string): { role: 'developer' | 'admin' | 'user'; approved: boolean } => {
    if (claimRole === 'developer') return { role: 'developer', approved: true };
    if (claimRole === 'admin') return { role: 'admin', approved: true };
    return { role: 'user', approved: false };
  };



  // Sync Firebase Auth state strictly with Firestore users/{uid}
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseAuthUser(fbUser);
      if (fbUser) {
        const email = fbUser.email || '';
        
        try {
          const idTokenResult = await fbUser.getIdTokenResult();
          const claimRole = idTokenResult.claims.role as string | undefined;
          const { role, approved } = resolveUserRole(email, claimRole);

          const tempUser: UserModel = {
            id: fbUser.uid,
            name: fbUser.displayName || email.split('@')[0].toUpperCase(),
            email,
            role,
            approved,
            permissions: role === 'developer' ? ['All'] : role === 'admin' ? ['Events', 'Results', 'Leaderboard', 'Gallery', 'Announcements'] : [],
            status: 'Active',
            avatarUrl: fbUser.photoURL || undefined,
            createdAt: new Date().toISOString(),
          };

          // Immediately persist so the navbar shows the user right away
          persistUser(tempUser);

          // Then sync with Firestore in background — may upgrade role if pre-authorized
          syncUserToFirestore(tempUser).catch((e) => console.warn('Firestore sync bg error:', e));
        } catch (error) {
          console.error("Error fetching custom claims:", error);
        }
      } else {
        // No Firebase user — only clear state if nothing is cached
        const cached = localStorage.getItem(LOCAL_USER_KEY);
        if (!cached) {
          setCurrentUser(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firestore Users Collection changes in real time
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          const firestoreUsers: UserModel[] = [];
          snapshot.forEach((d) => firestoreUsers.push({ id: d.id, ...d.data() } as UserModel));
          
          if (firestoreUsers.length > 0) {
            setUsers(firestoreUsers);
          }

          if (currentUser) {
            const match = firestoreUsers.find((u) => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase());
            if (match && (match.role !== currentUser.role || match.approved !== currentUser.approved)) {
              persistUser(match);
            }
          }
        },
        (err) => console.warn('Firestore users subscription notice:', err)
      );
      return () => unsub();
    } catch {
      // Local fallback
    }
  }, [currentUser]);

  // Public reference collections: every page gets live Firebase updates.
  useEffect(() => {
    const subscriptions: Array<() => void> = [];

    try {
      subscriptions.push(onSnapshot(
        collection(db, 'houses'),
        (snapshot) => {
          const firestoreHouses: HouseModel[] = [];
          snapshot.forEach((d) => firestoreHouses.push({ id: d.id as HouseId, ...d.data() } as HouseModel));
          if (firestoreHouses.length > 0) {
            setHouses((prev) =>
              prev.map((house) => firestoreHouses.find((item) => item.id === house.id) || house)
            );
          }
        },
        (err) => console.warn('Firestore houses subscription notice:', err)
      ));
    } catch (err) {
      console.warn('Failed to subscribe to houses:', err);
    }

    try {
      subscriptions.push(onSnapshot(
        collection(db, 'stages'),
        (snapshot) => {
          const firestoreStages: StageModel[] = [];
          snapshot.forEach((d) => firestoreStages.push({ id: d.id, ...d.data() } as StageModel));
          if (firestoreStages.length > 0) {
            setStages((prev) =>
              prev.map((stage) => firestoreStages.find((item) => item.id === stage.id || item.name === stage.name) || stage)
            );
          }
        },
        (err) => console.warn('Firestore stages subscription notice:', err)
      ));
    } catch (err) {
      console.warn('Failed to subscribe to stages:', err);
    }

    try {
      subscriptions.push(onSnapshot(
        collection(db, 'liveFeed'),
        (snapshot) => {
          const firestoreFeed: LiveActivityFeedItem[] = [];
          snapshot.forEach((d) => firestoreFeed.push({ id: d.id, ...d.data() } as LiveActivityFeedItem));
          setLiveFeed(sortByCreatedAtDesc(firestoreFeed));
        },
        (err) => console.warn('Firestore liveFeed subscription notice:', err)
      ));
    } catch (err) {
      console.warn('Failed to subscribe to liveFeed:', err);
    }

    try {
      subscriptions.push(onSnapshot(
        collection(db, 'auditLogs'),
        (snapshot) => {
          const firestoreLogs: AuditLogItem[] = [];
          snapshot.forEach((d) => firestoreLogs.push({ id: d.id, ...d.data() } as AuditLogItem));
          setAuditLogs(sortByCreatedAtDesc(firestoreLogs));
        },
        (err) => console.warn('Firestore auditLogs subscription notice:', err)
      ));
    } catch (err) {
      console.warn('Failed to subscribe to auditLogs:', err);
    }

    try {
      subscriptions.push(onSnapshot(
        collection(db, 'gallery'),
        (snapshot) => {
          const firestoreGallery: GalleryItemModel[] = [];
          snapshot.forEach((d) => firestoreGallery.push({ id: d.id, ...d.data() } as GalleryItemModel));
          setGallery(firestoreGallery);
        },
        (err) => console.warn('Firestore gallery subscription notice:', err)
      ));
    } catch (err) {
      console.warn('Failed to subscribe to gallery:', err);
    }

    return () => subscriptions.forEach((unsubscribe) => unsubscribe());
  }, []);

  // Listen to Firestore Events Collection changes in real time
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'events'),
        (snapshot) => {
          const firestoreEvents: EventModel[] = [];
          snapshot.forEach((d) => firestoreEvents.push({ id: d.id, ...d.data() } as EventModel));

          const canonicalEvents = [...initialEvents, ...houseEvents];
          const canonicalById = new Map(canonicalEvents.map((event) => [event.id, event]));
          
          // Create a name-to-canonical mapping to detect conflicts
          const canonicalByName = new Map(canonicalEvents.map((event) => [event.eventName.toLowerCase(), event]));
          
          // Filter out Firestore events that conflict with canonical house events
          const filteredFirestoreEvents = firestoreEvents.filter((fsEvent) => {
            const canonicalEvent = canonicalByName.get(fsEvent.eventName?.toLowerCase());
            // If there's a canonical event with same name that's a house event, exclude the Firestore version
            if (canonicalEvent && canonicalEvent.houseWise && canonicalEvent.category === 'House Item') {
              console.warn(`Excluding Firestore event "${fsEvent.eventName}" (${fsEvent.id}) - conflicts with canonical house event ${canonicalEvent.id}`);
              return false;
            }
            return true;
          });
          
          const sourceEvents = filteredFirestoreEvents.length > 0 
            ? [...canonicalEvents, ...filteredFirestoreEvents] 
            : canonicalEvents;

          const mergedEvents = sourceEvents.map((sourceEvent) => {
            const localEvent = canonicalById.get(sourceEvent.id) || sourceEvent;
            const firestoreEvent = filteredFirestoreEvents.find((event) => event.id === localEvent.id);
            const rawMerged = firestoreEvent
              ? { ...localEvent, ...getOperationalEventFields(firestoreEvent) }
              : localEvent;

            const venueClean = cleanVenueName(rawMerged.venue, rawMerged.stage);
            const mergedEvent = {
              ...rawMerged,
              venue: venueClean,
            };

            return publishedResultEventIdsRef.current.has(localEvent.id)
              ? {
                  ...mergedEvent,
                  resultsPublished: true,
                  winnerUploaded: true,
                  housePointsUpdated: true,
                }
              : mergedEvent;
          });
          
          // Filter out Digital Painting Cat 4 (removed from festival)
          const validEvents = mergedEvents.filter((evt) => {
            if (evt.id === 'evt-s7-6' || evt.id === 's7-6') return false;
            const name = (evt.eventName || '').toLowerCase();
            if (name.includes('digital painting') && (name.includes('cat 4') || name.includes('cat iv'))) return false;
            return true;
          });

          // Sort events by date and time
          validEvents.sort((a, b) => {
            const timeA = new Date(`${a.date}T${a.scheduledStartTime || '00:00'}`).getTime();
            const timeB = new Date(`${b.date}T${b.scheduledStartTime || '00:00'}`).getTime();
            return (timeA || 0) - (timeB || 0);
          });
          setEvents(validEvents);
        },
        (err) => console.warn('Firestore events subscription notice:', err)
      );
      return () => unsub();
    } catch (err) {
      console.error('Failed to subscribe to events:', err);
    }
  }, []);

  // Listen to Firestore results so published backend/OCR results remove events from upload queues.
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'results'),
        (snapshot) => {
          const firestoreResults: EventResultModel[] = [];

          snapshot.forEach((d) => {
            const data = d.data() as any;
            if (!isPublishedResultRecord(data)) return;

            if (Array.isArray(data.results)) {
              data.results.forEach((item: any, index: number) => {
                const houseId = String(item.house || item.houseId || 'NONE').toUpperCase() as HouseId;
                firestoreResults.push({
                  id: `${d.id}-${index}`,
                  eventId: data.eventId || d.id,
                  festivalId: data.festivalId || '2k26',
                  eventTitle: data.competitionName || data.eventTitle || data.eventName || 'Competition',
                  category: data.category || 'General',
                  participantName: item.studentName || item.participantName || '',
                  studentClass: item.studentClass || '',
                  houseId,
                  houseName: houseId === 'NONE' ? 'Non-House / Individual' : houseId,
                  position: normalizePositionLabel(item.position),
                  points: Number(item.points) || 0,
                  createdAt: data.publishedAt?.toDate?.().toISOString?.() || data.createdAt || new Date().toISOString(),
                  status: data.published ? 'Published' : data.status || 'Published',
                  judgeNotes: data.judgeNotes,
                });
              });
              return;
            }

            firestoreResults.push({
              id: d.id,
              ...data,
              status: data.status || (data.published ? 'Published' : 'Published'),
            } as EventResultModel);
          });

          setResults(firestoreResults);

          applyPublishedResultsToEvents(firestoreResults);
        },
        (err) => console.warn('Firestore results subscription notice:', err)
      );
      return () => unsub();
    } catch (err) {
      console.error('Failed to subscribe to results:', err);
    }
  }, []);

  // Backend fallback/polling feed for deployed static site. This also updates without page refresh.
  useEffect(() => {
    let cancelled = false;

    const loadPublishedResults = async () => {
      try {
        const response = await fetch(`${API_URL}/api/publish`, { cache: 'no-store' });
        if (!response.ok) return;
        const payload = await response.json();
        if (cancelled || !Array.isArray(payload.results)) return;

        const apiResults = payload.results as EventResultModel[];
        setResults(apiResults);
        applyPublishedResultsToEvents(apiResults);
      } catch (err) {
        console.warn('Published results API fallback notice:', err);
      }
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        loadPublishedResults();
      }
    };

    loadPublishedResults();
    const interval = window.setInterval(loadPublishedResults, 5000);
    window.addEventListener('focus', loadPublishedResults);
    window.addEventListener('online', loadPublishedResults);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener('focus', loadPublishedResults);
      window.removeEventListener('online', loadPublishedResults);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, []);

  // Listen to Firestore resultDrafts Collection
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'resultDrafts'),
        (snapshot) => {
          const drafts: ResultDraftModel[] = [];
          snapshot.forEach((d) => drafts.push({ id: d.id, ...d.data() } as ResultDraftModel));
          // Sort by newest first
          drafts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setResultDrafts(drafts);
        },
        (err) => console.warn('Firestore resultDrafts subscription notice:', err)
      );
      return () => unsub();
    } catch (err) {
      console.error('Failed to subscribe to resultDrafts:', err);
    }
  }, []);

  // Dynamic Point Computation Engine
  const getHousePoints = (houseId: HouseId, _day?: LeaderboardDay): number => {
    const published = results.filter((r) => r.houseId === houseId && (r.status === 'Published' || r.status === 'Verified'));
    return published.reduce((sum, r) => sum + r.points, 0);
  };

  const getHouseMedals = (houseId: HouseId) => {
    const published = results.filter((r) => r.houseId === houseId && (r.status === 'Published' || r.status === 'Verified'));
    const gold = published.filter((r) => r.position === '1st').length;
    const silver = published.filter((r) => r.position === '2nd').length;
    const bronze = published.filter((r) => r.position === '3rd').length;
    return { gold, silver, bronze, total: gold + silver + bronze };
  };

  const getHouseRank = (houseId: HouseId): number => {
    const targetPoints = getHousePoints(houseId);
    const distinctHigher = new Set(
      houses.map((h) => getHousePoints(h.id)).filter((pts) => pts > targetPoints)
    );
    return distinctHigher.size + 1;
  };

  // Note: signInWithRedirect is NOT used — it causes "missing initial state" errors
  // on Android Chrome due to storage partitioning. signInWithPopup works on all
  // devices when triggered by a real user tap (button gesture).


  const syncSignedInFirebaseUser = async (fbUser: FirebaseUser) => {
    const email = fbUser.email || '';
    const tempUser: UserModel = {
      id: fbUser.uid,
      name: fbUser.displayName || email.split('@')[0].toUpperCase(),
      email,
      role: 'user',
      approved: false,
      permissions: [],
      status: 'Active',
      avatarUrl: fbUser.photoURL || undefined,
      createdAt: new Date().toISOString(),
    };
    await syncUserToFirestore(tempUser);
  };

  // Google Auth — always uses signInWithPopup on all devices.
  // signInWithRedirect is intentionally avoided: Chrome's storage partitioning
  // (privacy feature) wipes sessionStorage during cross-site redirects,
  // causing "missing initial state" errors on Android.
  // signInWithPopup works on mobile when triggered by a real button tap.
  const loginWithGoogle = async (): Promise<'signed-in' | 'redirecting'> => {
    const provider = googleProvider;
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({ prompt: 'select_account' });

    const result = await signInWithPopup(auth, provider);
    if (result?.user) {
      await syncSignedInFirebaseUser(result.user);
    }
    return 'signed-in';
  };

  const login = (role: 'developer' | 'admin' | 'user') => {
    const foundUser = users.find((u) => u.role === role) || users[0];
    persistUser(foundUser);
    logAuditAction(foundUser.name, foundUser.role, 'User Login', 'Auth', `Logged in as ${role}`);
  };

  const loginCustomUser = (email: string) => {
    let foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!foundUser) {
      if (email.toLowerCase() === 'vaishnavil4433@gmail.com') {
        foundUser = {
          id: `dev-${Date.now()}`,
          name: 'Vaishnavi (System Developer)',
          email,
          role: 'developer',
          approved: true,
          permissions: ['All'],
          status: 'Active',
        };
      } else if (email.toLowerCase() === 'teacher@gmail.com') {
        foundUser = {
          id: `admin-${Date.now()}`,
          name: 'Liju Teacher (Stage Admin)',
          email,
          role: 'admin',
          approved: true,
          permissions: ['Events', 'Results', 'Leaderboard', 'Gallery', 'Announcements'],
          status: 'Active',
        };
      } else {
        foundUser = {
          id: `user-${Date.now()}`,
          name: email.split('@')[0].toUpperCase(),
          email,
          role: 'user',
          approved: false,
          permissions: [],
          status: 'Active',
        };
      }
      setUsers((prev) => [...prev, foundUser!]);
    }

    persistUser(foundUser);
    logAuditAction(foundUser.name, foundUser.role, 'User Google Login', 'Auth', `Logged in with ${email} as ${foundUser.role}`);
  };

  const logout = async () => {
    if (currentUser) {
      logAuditAction(currentUser.name, currentUser.role, 'User Logout', 'Auth', 'User logged out');
    }
    
    try {
      await signOut(auth);
    } catch {
      // Ignore
    }

    localStorage.clear();
    sessionStorage.clear();

    persistUser(null);
    setFirebaseAuthUser(null);
  };

  const logAuditAction = (user: string, role: any, action: string, entity: string, details: string) => {
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
      user,
      userRole: role,
      action,
      entity,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    setDoc(doc(db, 'auditLogs', newLog.id), newLog).catch((err) =>
      console.warn('Firestore audit log write notice:', err)
    );
  };

  const addEvent = async (eventName: string, category: string, catLevel: string) => {
    const newEvent: EventModel = {
      id: `evt-custom-${Date.now()}`,
      eventName: `${eventName} (${catLevel})`,
      category,
      type: 'Individual',
      language: 'Common',
      houseWise: false,
      competitionType: 'individual',
      stage: null,
      venue: null,
      date: '2026-08-10',
      scheduledStartTime: '09:00',
      durationMinutes: 30,
      delayMinutes: 0,
      actualStartTime: null,
      actualEndTime: null,
      cancelled: false,
      postponed: false,
      status: 'Upcoming',
      publishToWebsite: true,
      resultsPublished: false,
      winnerUploaded: false,
      housePointsUpdated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEvents((prev) => [...prev, newEvent]);
    setDoc(doc(db, 'events', newEvent.id), newEvent).catch(console.error);
    logAuditAction(
      currentUser?.name || 'Admin',
      currentUser?.role || 'admin',
      'Added Custom Event',
      newEvent.eventName,
      `Category: ${category}, Level: ${catLevel}`
    );
  };

  const delayEvent = async (eventId: string, minutes: number) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      const target = events.find((e) => e.id === eventId);
      if (target) {
        const newDelay = Math.max(0, (target.delayMinutes || 0) + minutes);
        await setDoc(eventRef, { delayMinutes: newDelay }, { merge: true });
        
        logAuditAction(
          currentUser?.name || 'Admin',
          currentUser?.role || 'admin',
          'Delayed Event',
          target.eventName,
          `Event delayed by ${minutes} minutes. Total delay: ${newDelay} mins.`
        );
      }
    } catch (e) {
      console.error('Failed to delay event:', e);
    }
  };

  const cleanupConflictingEvents = async () => {
    try {
      const canonicalEvents = [...initialEvents, ...houseEvents];
      const canonicalByName = new Map(canonicalEvents.map((event) => [event.eventName.toLowerCase(), event]));
      
      // Find Firestore events that conflict with canonical house events
      const conflictingEvents = events.filter((event) => {
        if (event.id.startsWith('evt-custom-')) {
          const canonicalEvent = canonicalByName.get(event.eventName?.toLowerCase());
          return canonicalEvent && canonicalEvent.houseWise && canonicalEvent.category === 'House Item';
        }
        return false;
      });
      
      // Delete conflicting events from Firestore
      for (const conflictEvent of conflictingEvents) {
        await deleteDoc(doc(db, 'events', conflictEvent.id));
        console.log(`Deleted conflicting event: ${conflictEvent.eventName} (${conflictEvent.id})`);
      }
      
      if (conflictingEvents.length > 0) {
        logAuditAction(
          currentUser?.name || 'System',
          currentUser?.role || 'admin',
          'Cleaned Conflicting Events',
          'System Maintenance',
          `Removed ${conflictingEvents.length} custom events that conflicted with canonical house events`
        );
      }
    } catch (e) {
      console.error('Failed to cleanup conflicting events:', e);
    }
  };

  // Result Workflow Actions
  const submitResult = (newResultData: Omit<EventResultModel, 'id' | 'createdAt' | 'status'>) => {
    // Determine correct points based on the event's competitionType
    const sourceEvent = events.find((e) => e.id === newResultData.eventId);
    const compType = sourceEvent?.competitionType || 'individual';

    let pointsToAdd = 0;
    if (newResultData.houseId === 'NONE') {
      pointsToAdd = 0;
    } else if (compType === 'group') {
      // Large group items (Mime, Group Dance, Group Song): 1st=20, 2nd=15, 3rd=10
      if (newResultData.position === '1st') pointsToAdd = 20;
      else if (newResultData.position === '2nd') pointsToAdd = 15;
      else if (newResultData.position === '3rd') pointsToAdd = 10;
    } else {
      // team (PPT — 2 members) + individual (Anchoring, Turn Coat, Declamation, Western Music): 1st=10, 2nd=7, 3rd=5
      if (newResultData.position === '1st') pointsToAdd = 10;
      else if (newResultData.position === '2nd') pointsToAdd = 7;
      else if (newResultData.position === '3rd') pointsToAdd = 5;
    }
    
    const newResult: EventResultModel = {
      ...newResultData,
      points: pointsToAdd,
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'Published',
      createdAt: new Date().toISOString(),
    };
    
    setResults((prev) => [newResult, ...prev]);

    setEvents((prev) =>
      prev.map((e) => (e.id === newResultData.eventId ? { ...e, resultsPublished: true, winnerUploaded: true, housePointsUpdated: true } : e))
    );
    
    // Also update Firestore immediately so hosted/static sessions autoload the result.
    setDoc(doc(db, 'events', newResultData.eventId), { resultsPublished: true, winnerUploaded: true, housePointsUpdated: true }, { merge: true }).catch(console.error);
    setDoc(doc(db, 'results', newResult.id), newResult, { merge: true }).catch(console.error);

    logAuditAction(
      currentUser?.name || 'Admin',
      currentUser?.role || 'admin',
      'Submitted & Calculated House Result',
      newResultData.eventTitle,
      `Awarded ${newResultData.position} (+${pointsToAdd} pts) to ${newResultData.participantName} (${newResultData.houseId} House)`
    );
  };

  const verifyResult = (resultId: string) => {
    setResults((prev) =>
      prev.map((r) => (r.id === resultId ? { ...r, status: 'Verified' as const } : r))
    );
    logAuditAction(
      currentUser?.name || 'Admin',
      currentUser?.role || 'admin',
      'Verified Result',
      'Result Queue',
      `Verified result ID ${resultId}`
    );
  };

  const publishResult = (resultId: string) => {
    const target = results.find((r) => r.id === resultId);
    if (!target) return;

    setResults((prev) =>
      prev.map((r) => (r.id === resultId ? { ...r, status: 'Published' as const } : r))
    );

    setEvents((prev) =>
      prev.map((e) => (e.id === target.eventId ? { ...e, resultsPublished: true, winnerUploaded: true, housePointsUpdated: true } : e))
    );
    
    setDoc(doc(db, 'events', target.eventId), { resultsPublished: true, winnerUploaded: true, housePointsUpdated: true }, { merge: true }).catch(console.error);

    const newFeedItem: LiveActivityFeedItem = {
      id: `feed-${Date.now()}`,
      festivalId: '2k26',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'Result',
      priority: 'Important',
      content: `${target.houseId} wins ${target.position} position in ${target.eventTitle}! +${target.points} Points.`,
      houseId: target.houseId,
      points: target.points,
      read: false,
    };
    setLiveFeed((prev) => [newFeedItem, ...prev]);

    logAuditAction(
      currentUser?.name || 'Admin',
      currentUser?.role || 'admin',
      'Published Result',
      target.eventTitle,
      `Published result. House ${target.houseId} received +${target.points} pts.`
    );
  };

  const deleteResult = async (resultId: string) => {
    const target = results.find((r) => r.id === resultId);
    if (!target) return;

    try {
      // Remove from local state first
      setResults((prev) => prev.filter((r) => r.id !== resultId));

      // If this was the only result for the event, mark event as no longer having results
      const remainingForEvent = results.filter((r) => r.id !== resultId && r.eventId === target.eventId);
      if (remainingForEvent.length === 0) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === target.eventId
              ? { ...e, resultsPublished: false, winnerUploaded: false, housePointsUpdated: false }
              : e
          )
        );
        
        try {
          await setDoc(doc(db, 'events', target.eventId), { 
            resultsPublished: false, 
            winnerUploaded: false, 
            housePointsUpdated: false 
          }, { merge: true });
        } catch (eventError: any) {
          console.warn('Failed to update event status, but result deleted locally:', eventError.message);
        }
      }

      // Try to delete from Firestore
      try {
        await deleteDoc(doc(db, 'results', resultId));
        console.log(`Successfully deleted result ${resultId} from Firestore`);
      } catch (firestoreError: any) {
        console.warn('Failed to delete from Firestore, but removed locally:', firestoreError.message);
        
        // Show user-friendly error if quota exceeded
        if (firestoreError.code === 'resource-exhausted') {
          alert('⚠️ Firebase quota exceeded. Result removed locally but may reappear after page refresh. Consider upgrading Firebase plan or try again later.');
        } else {
          alert(`⚠️ Delete partially failed: ${firestoreError.message}. Result removed from local view.`);
        }
      }

      // Post a live activity feed notice so attendees see it was retracted
      const deletionNotice: LiveActivityFeedItem = {
        id: `feed-del-${Date.now()}`,
        festivalId: '2k26',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'Stage Update',
        priority: 'Important',
        content: `⚠️ Result retracted: ${target.eventTitle} — ${target.position} place (${target.participantName}) has been removed by admin. Leaderboard updated.`,
        houseId: target.houseId,
        points: 0,
        read: false,
      };
      setLiveFeed((prev) => [deletionNotice, ...prev]);

      // Announce via the live feed
      addAnnouncement(
        `⚠️ Result Retracted: ${target.eventTitle} — ${target.position} place result for ${target.participantName} (${target.houseId}) has been removed. Scores have been updated.`,
        'Stage Update',
        'Important'
      );

      logAuditAction(
        currentUser?.name || 'Admin',
        currentUser?.role || 'admin',
        'Deleted Result',
        target.eventTitle,
        `Removed ${target.position} place result for ${target.participantName} (${target.houseId}, -${target.points} pts)`
      );
      
    } catch (error: any) {
      console.error('Delete result failed:', error);
      
      // Restore the result to local state if complete deletion failed
      setResults((prev) => [...prev, target]);
      
      // Show user-friendly error message
      if (error.code === 'resource-exhausted') {
        alert('❌ Cannot delete result: Firebase quota exceeded. Please try again later or upgrade your Firebase plan.');
      } else {
        alert(`❌ Delete failed: ${error.message}`);
      }
    }
  };

  const publishEventWinners = async (
    eventId: string,
    judgeNotes: string,
    winners: Array<{
      position: '1st' | '2nd' | '3rd';
      studentName: string;
      studentClass: string;
      houseId: HouseId;
      points: number;
    }>
  ) => {
    const targetEvent = events.find((e) => e.id === eventId);
    const eventTitle = targetEvent?.eventName || 'Competition';
    const category = targetEvent?.category || 'General';

    const newResults: EventResultModel[] = winners.map((w) => ({
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventId,
      festivalId: '2k26',
      eventTitle,
      category,
      participantName: w.studentName,
      studentClass: w.studentClass,
      houseId: w.houseId,
      houseName: w.houseId,
      position: w.position,
      points: w.points,
      createdAt: new Date().toISOString(),
      status: 'Published',
      judgeNotes,
    }));

    // Update local results state
    setResults((prev) => [...newResults, ...prev]);

    // Update local events state
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              status: 'Completed',
              resultsPublished: true,
              winnerUploaded: true,
              housePointsUpdated: true,
            }
          : e
      )
    );

    // Sync to Firestore
    try {
      const eventRef = doc(db, 'events', eventId);
      await setDoc(
        eventRef,
        {
          status: 'Completed',
          resultsPublished: true,
          winnerUploaded: true,
          housePointsUpdated: true,
        },
        { merge: true }
      );

      for (const resItem of newResults) {
        await setDoc(doc(db, 'results', resItem.id), resItem);
      }
    } catch (err) {
      console.warn('Firestore sync notice:', err);
    }

    // Create Announcement Feed Item
    const topWinner = winners.find((w) => w.position === '1st');
    const feedContent = topWinner
      ? `🏆 ${eventTitle} (${category}) Results Published! 1st: ${topWinner.studentName} (${topWinner.houseId} House +${topWinner.points} pts)`
      : `🏆 ${eventTitle} Results Published!`;

    addAnnouncement(feedContent, 'Result', 'Important', topWinner?.houseId, topWinner?.points);

    logAuditAction(
      currentUser?.name || 'Admin',
      currentUser?.role || 'admin',
      'Published Competition Winners',
      eventTitle,
      `Published ${winners.length} winner positions for ${eventTitle}`
    );
  };

  const addAnnouncement = (
    content: string,
    type: AnnouncementType,
    priority: PriorityLevel,
    houseId?: HouseId,
    points?: number
  ) => {
    const newItem: LiveActivityFeedItem = {
      id: `feed-${Date.now()}`,
      festivalId: '2k26',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
      type,
      priority,
      content,
      houseId,
      points,
      read: false,
    };
    setLiveFeed((prev) => [newItem, ...prev]);
    setDoc(doc(db, 'liveFeed', newItem.id), newItem).catch((err) =>
      console.warn('Firestore liveFeed write notice:', err)
    );
    setDoc(doc(db, 'announcements', newItem.id), newItem).catch((err) =>
      console.warn('Firestore announcement write notice:', err)
    );
    logAuditAction(
      currentUser?.name || 'Admin',
      currentUser?.role || 'admin',
      'Created Announcement',
      type,
      content
    );
  };

  const deleteAnnouncement = (feedId: string) => {
    setLiveFeed((prev) => prev.filter((f) => f.id !== feedId));
    deleteDoc(doc(db, 'liveFeed', feedId)).catch(console.error);
    deleteDoc(doc(db, 'announcements', feedId)).catch(console.error);
    logAuditAction(
      currentUser?.name || 'Admin',
      currentUser?.role || 'admin',
      'Deleted Announcement',
      'Live Feed',
      `Removed announcement ID ${feedId}`
    );
  };

  const togglePermission = (userId: string, permission: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const hasPermission = targetUser.permissions.includes(permission);
    const updatedUser: UserModel = {
      ...targetUser,
      permissions: hasPermission
        ? targetUser.permissions.filter((p) => p !== permission)
        : [...targetUser.permissions, permission],
    };

    setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
    if (updatedUser) {
      setDoc(doc(db, 'users', updatedUser.id), updatedUser, { merge: true }).catch((err) =>
        console.warn('Firestore permission write notice:', err)
      );
    }
    logAuditAction(
      currentUser?.name || 'Developer',
      'developer',
      'Updated User Permissions',
      'RBAC Grid',
      `Toggled ${permission} for user ${userId}`
    );
  };

  // Flexible Role Management: Writes directly to Firestore users/{uid} with merge
  const setUserRole = async (userId: string, targetRole: 'developer' | 'admin' | 'user') => {
    const targetUser = users.find((u) => u.id === userId || u.email.toLowerCase() === userId.toLowerCase());
    if (!targetUser) return;

    const isApproved = targetRole !== 'user';
    const updatedUser: UserModel = {
      ...targetUser,
      role: targetRole,
      approved: isApproved,
      permissions: targetRole === 'developer' ? ['All'] : targetRole === 'admin' ? ['Events', 'Results', 'Leaderboard', 'Gallery', 'Announcements'] : [],
    };

    setUsers((prev) =>
      prev.map((u) => (u.id === targetUser.id || u.email.toLowerCase() === targetUser.email.toLowerCase() ? updatedUser : u))
    );

    if (currentUser && (currentUser.id === targetUser.id || currentUser.email.toLowerCase() === targetUser.email.toLowerCase())) {
      persistUser(updatedUser);
    }

    try {
      const userRef = doc(db, 'users', targetUser.id);
      await setDoc(userRef, updatedUser, { merge: true });
    } catch (err) {
      console.warn('Firestore setUserRole Notice:', err);
    }

    logAuditAction(
      currentUser?.name || 'Developer',
      'developer',
      `Set User Role to ${targetRole}`,
      'User Management',
      `Changed role of ${targetUser.name} (${targetUser.email}) to ${targetRole}`
    );
  };

  const toggleAdminAccess = async (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const isNowAdmin = targetUser.role !== 'admin' && targetUser.role !== 'Admin';
    setUserRole(userId, isNowAdmin ? 'admin' : 'user');
  };

  const createAdminUser = (name: string, email: string) => {
    const newUser: UserModel = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: 'admin',
      approved: true,
      permissions: ['Events', 'Results', 'Leaderboard', 'Gallery', 'Announcements'],
      status: 'Active',
    };
    setUsers((prev) => [...prev, newUser]);
    setDoc(doc(db, 'users', newUser.id), newUser, { merge: true }).catch((err) =>
      console.warn('Firestore create admin notice:', err)
    );
    logAuditAction(
      currentUser?.name || 'Developer',
      'developer',
      'Created Admin User',
      'User Management',
      `Created new admin account for ${email}`
    );
  };

  const removeUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    deleteDoc(doc(db, 'users', userId)).catch((err) =>
      console.warn('Firestore remove user notice:', err)
    );
    logAuditAction(
      currentUser?.name || 'Developer',
      'developer',
      'Removed User',
      'User Management',
      `Removed user account ${userId}`
    );
  };

  const toggleArchiveMode = () => {
    setArchiveMode((prev) => !prev);
    logAuditAction(
      currentUser?.name || 'Developer',
      'developer',
      'Toggled Archive Mode',
      'System Settings',
      `Archive Mode changed to ${!archiveMode}`
    );
  };

  const markFeedRead = () => {
    setLiveFeed((prev) => prev.map((f) => ({ ...f, read: true })));
    liveFeed.forEach((item) => {
      if (!item.read) {
        setDoc(doc(db, 'liveFeed', item.id), { read: true }, { merge: true }).catch(() => {});
      }
    });
  };

  return (
    <FestivalContext.Provider
      value={{
        festival,
        houses,
        stages,
        events: computedEvents,
        results,
        resultDrafts,
        liveFeed,
        auditLogs,
        users,
        gallery,
        currentUser,
        firebaseAuthUser,
        archiveMode,
        getHousePoints,
        getHouseRank,
        getHouseMedals,
        delayEvent,
        addEvent,
        login,
        loginWithGoogle,
        loginCustomUser,
        logout,
        submitResult,
        verifyResult,
        publishResult,
        deleteResult,
        cleanupConflictingEvents,
        publishEventWinners,
        addAnnouncement,
        deleteAnnouncement,
        togglePermission,
        setUserRole,
        toggleAdminAccess,
        createAdminUser,
        removeUser,
        toggleArchiveMode,
        markFeedRead,
      }}
    >
      {children}
    </FestivalContext.Provider>
  );
};

export const useFestival = () => {
  const context = useContext(FestivalContext);
  if (!context) {
    throw new Error('useFestival must be used within a FestivalProvider');
  }
  return context;
};
