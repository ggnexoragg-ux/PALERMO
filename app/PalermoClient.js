'use client'

import { useEffect, useRef, useState } from 'react'

const DEFAULT_ROLES = [
  { id: 'visibleKiller', label: 'Revealed Killer', emoji: '🔪', count: 1, min: 1 },
  { id: 'hiddenKiller', label: 'Hidden Killer', emoji: '🗡️', count: 1, min: 1 },
  { id: 'detective', label: 'Detective', emoji: '🕵️', count: 1, min: 0 },
  { id: 'doctor', label: 'Doctor', emoji: '🩺', count: 1, min: 0 },
  { id: 'lover', label: 'Lover', emoji: '❤️', count: 0, min: 0 },
  { id: 'kamikaze', label: 'Kamikaze', emoji: '💣', count: 0, min: 0 },
  { id: 'madness', label: 'Madness', emoji: '🌀', count: 0, min: 0 },
]

const citizen = { id: 'citizen', label: 'Citizen', emoji: '👤' }

const SUPABASE_URL = 'https://xwckthedqrgbnfvwccyr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3Y2t0aGVkcXJnYm5mdndjY3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3Nzk3NDgsImV4cCI6MjEwNjM1NTc0OH0.kRANBc_vOD6epHHqWrGkJamgxN9enlY_siBnzmpakNM'
const REGISTRY_HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
}

async function fetchPublicRooms() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/palermo_rooms?select=room_code,room_name,host_name,language,access_mode,player_count,max_players,spectator_count,max_spectators,narrator_enabled,started,heartbeat_at&order=created_at.desc`, {
    headers: REGISTRY_HEADERS,
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('room_list_failed')
  return res.json()
}

async function writeRoomRegistry(room, hostToken, update = false) {
  if (!hostToken) throw new Error('missing_registry_token')
  const fn = update ? 'palermo_update_room' : 'palermo_register_room'
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: REGISTRY_HEADERS,
    body: JSON.stringify({
      p_room_code: room.room_code,
      p_room_name: room.room_name,
      p_host_name: room.host_name,
      p_language: room.language,
      p_access_mode: room.access_mode,
      p_player_count: room.player_count,
      p_max_players: room.max_players,
      p_spectator_count: room.spectator_count,
      p_max_spectators: room.max_spectators,
      p_narrator_enabled: room.narrator_enabled,
      p_started: room.started,
      p_host_token: hostToken,
    }),
  })
  if (!res.ok) throw new Error('room_registry_failed')
}

async function retireRoomRegistry(code, hostToken) {
  if (!code || !hostToken) return
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/palermo_retire_room`, {
    method: 'POST',
    headers: REGISTRY_HEADERS,
    body: JSON.stringify({ p_room_code: code, p_host_token: hostToken }),
  })
  if (!res.ok) throw new Error('room_retire_failed')
}

const TEXT = {
  en: {
    browserGame: 'BROWSER GAME',
    realtimeLobby: 'REAL-TIME LOBBY',
    chooseLanguage: 'CHOOSE YOUR LANGUAGE',
    english: 'ENGLISH',
    greek: 'ΕΛΛΗΝΙΚΑ',
    social: 'SOCIAL DEDUCTION // NO DOWNLOAD',
    intro: 'Create a room, send your friends the code, and everyone who joins appears in the lobby for real.',
    displayName: 'DISPLAY NAME',
    createRoom: 'CREATE ROOM',
    joinRoom: 'JOIN ROOM',
    noAccount: 'NO ACCOUNT',
    realPlayers: 'REAL PLAYERS',
    roomCodes: 'ROOM CODES',
    readySystem: 'READY SYSTEM',
    roleReveal: 'ROLE REVEAL',
    back: 'BACK',
    joinPrivate: 'JOIN A ROOM',
    publicRooms: 'PUBLIC SERVERS',
    noPublicRooms: 'No active rooms right now.',
    refreshRooms: 'REFRESH',
    roomName: 'ROOM NAME',
    access: 'ROOM ACCESS',
    openRoom: 'OPEN',
    approvalRoom: 'HOST APPROVAL',
    passwordRoom: 'PASSWORD',
    roomPassword: 'ROOM PASSWORD',
    requestPending: 'Waiting for the host to approve your request...',
    requestJoin: 'REQUEST TO JOIN',
    approve: 'APPROVE',
    deny: 'DENY',
    joinRequests: 'JOIN REQUESTS',
    wrongPassword: 'Incorrect room password.',
    enterCode: 'ENTER CODE',
    player: 'PLAYER',
    spectator: 'SPECTATOR',
    connecting: 'CONNECTING...',
    privateRoom: 'PRIVATE ROOM',
    connected: 'CONNECTED',
    room: 'ROOM',
    copyCode: 'COPY CODE',
    players: 'PLAYERS',
    ready: 'READY',
    notReady: 'NOT READY',
    noPlayers: 'No players yet.',
    markReady: 'MARK READY',
    hostSettings: 'HOST SETTINGS',
    roomSettings: 'ROOM SETTINGS',
    host: 'HOST',
    synced: 'SYNCED',
    maxPlayers: 'MAX PLAYERS',
    maxSpectators: 'MAX SPECTATORS',
    spectators: 'SPECTATORS',
    voiceChat: 'VOICE CHAT',
    micReady: 'MIC READY',
    optional: 'OPTIONAL',
    voiceExplain: 'Enable your microphone for live daytime voice with the other living players.',
    enableMicrophone: 'ENABLE MICROPHONE',
    unmute: 'UNMUTE',
    muteMic: 'MUTE MIC',
    realPlayer: 'REAL PLAYER',
    realPlayersCount: 'REAL PLAYERS',
    startingIn: 'STARTING IN',
    startGame: 'START GAME',
    waitingReady: 'WAITING FOR READY',
    waitingHost: 'WAITING FOR HOST',
    privateScreen: 'THIS SCREEN IS PRIVATE',
    yourRole: 'YOUR ROLE',
    understand: 'I UNDERSTAND — ENTER GAME',
    round: 'ROUND',
    night: 'NIGHT',
    day: 'DAY',
    voting: 'VOTING',
    citySleeping: 'THE CITY IS SLEEPING',
    nightExplain: 'Special roles perform their actions. Ordinary citizens wait for morning.',
    resolveNight: 'RESOLVE NIGHT',
    discussion: 'DISCUSSION',
    dayExplain: 'All living players may speak.',
    startVote: 'START VOTE',
    castVote: 'CAST YOUR VOTE',
    skipVote: 'SKIP VOTE',
    lockVote: 'LOCK VOTE',
    alive: 'ALIVE',
    voice: 'VOICE',
    muted: 'MUTED',
    off: 'OFF',
    enableMic: 'ENABLE MIC',
    mute: 'MUTE',
    voiceNext: 'Live voice is enabled during daytime for living players. Night voice stays muted for now.',
    visibleKiller: 'Revealed Killer',
    hiddenKiller: 'Hidden Killer',
    detective: 'Detective',
    doctor: 'Doctor',
    lover: 'Lover',
    kamikaze: 'Kamikaze',
    madness: 'Madness',
    citizen: 'Citizen',
    roleVisibleKiller: 'You are the revealed killer. Each night, choose a target privately. You do not know the hidden killer\'s identity or choice.',
    roleHiddenKiller: 'You are the hidden killer. Each night, choose a target privately. You do not know the revealed killer\'s identity or choice.',
    roleDetective: 'You know who the revealed killer is. Use that information carefully without exposing yourself.',
    roleDoctor: 'Protect one player each night.',
    roleLover: 'You are linked to another Lover. If either of you dies, the other dies too.',
    roleKamikaze: 'You are on the evil side. Once during the day, you may detonate on one non-killer player. You and that player both die.',
    roleMadness: 'Your win condition does not follow the ordinary rules.',
    roleCitizen: 'Find the killers, survive, and vote carefully.',
    multiplayerLoading: 'Multiplayer is still loading. Try again in a second.',
    roomCollision: 'Room code collision. Please create a new room.',
    roomOpenFail: 'Could not open the room.',
    spectatorFull: 'Spectator slots are full.',
    playerFull: 'Player slots are full.',
    joinFail: 'Could not join room.',
    lostHost: 'Connection to host was lost.',
    connectFail: 'Could not connect to that room code.',
    micDenied: 'Microphone permission was denied or unavailable.',
    narrator: 'NARRATOR', narratorOn: 'ON', narratorOff: 'OFF', narratorHint: 'Game events are spoken in your selected language.',
    narrRole: 'Your role is', knownKiller: 'THE REVEALED KILLER IS', narrNight: 'Night falls over Palermo.', narrDay: 'Morning comes to Palermo. Discussion begins.', narrVote: 'Voting has started. Choose carefully.',
    reportBug: 'REPORT A BUG',
    reportBugTitle: 'REPORT A BUG',
    bugCategory: 'PROBLEM TYPE',
    bugDescription: 'WHAT HAPPENED?',
    bugGameplay: 'Gameplay',
    bugMultiplayer: 'Multiplayer',
    bugUi: 'Interface',
    bugAudio: 'Audio / Narrator',
    bugOther: 'Other',
    bugPlaceholder: 'Tell us what happened and what you expected.',
    bugSubmit: 'SEND REPORT',
    bugCancel: 'CANCEL',
    bugSending: 'SENDING...',
    bugThanks: 'Thanks — your report was sent.',
    bugFailed: 'Could not send the report. Please try again.',
    gameOver: 'GAME OVER',
    endGame: 'END GAME',
    whatNext: 'WHAT DO YOU WANT TO DO?',
    playAgain: 'PLAY AGAIN',
    playAgainHint: 'Fresh room, same rules, same host.',
    newSession: 'NEW SESSION',
    newSessionHint: 'Fresh room, same rules, random host.',
    leaveGame: 'LEAVE',
    leaveGameHint: 'Return to the server browser.',
    preparingSession: 'PREPARING NEW SESSION...',
    dead: 'DEAD',
    spectatorOnly: 'SPECTATOR ONLY',
    spectatorChat: 'SPECTATOR CHAT',
    spectatorChatHint: 'Only dead players and spectators can see these messages.',
    send: 'SEND',
    madnessWins: 'MADNESS WINS',
    citizensWin: 'CITIZENS WIN',
    killersWin: 'KILLERS WIN',
    mvp: 'MVP',
    allRoles: 'ALL ROLES',
    dayChat: 'DAY CHAT',
    dayChatHint: 'Alive players can talk and type during the two-minute discussion.',
    voteTime: 'TIME TO VOTE',
    eliminated: 'was eliminated. Their role was',
    noElimination: 'No player was eliminated.',
    nightDeath: 'did not survive the night.',
    nightSafe: 'No one died during the night.',
    playerLeftAbort: 'A player left. The match was cancelled and everyone returned to the lobby.',
    hostLeftAbort: 'The host left. The match was closed.',
    kamikazeAction: 'KAMIKAZE',
    kamikazeChoose: 'Choose one player to take down with you. This can only be used once during the day.',
    kamikazeUsed: 'BOMB USED',
    kamikazeBoom: 'detonated and took down',
    music: 'MENU MUSIC',
    musicOn: 'ON',
    musicOff: 'OFF',
    madeBy: 'Made by'
  },
  el: {
    browserGame: 'ΠΑΙΧΝΙΔΙ ΣΤΟΝ BROWSER',
    realtimeLobby: 'ΖΩΝΤΑΝΟ LOBBY',
    chooseLanguage: 'ΕΠΙΛΕΞΕ ΓΛΩΣΣΑ',
    english: 'ENGLISH',
    greek: 'ΕΛΛΗΝΙΚΑ',
    social: 'ΠΑΙΧΝΙΔΙ ΚΟΙΝΩΝΙΚΗΣ ΕΞΑΠΑΤΗΣΗΣ // ΧΩΡΙΣ ΛΗΨΗ',
    intro: 'Δημιούργησε δωμάτιο, στείλε τον κωδικό στους φίλους σου και όσοι μπαίνουν εμφανίζονται πραγματικά στο lobby.',
    displayName: 'ΟΝΟΜΑ ΠΑΙΚΤΗ',
    createRoom: 'ΔΗΜΙΟΥΡΓΙΑ ΔΩΜΑΤΙΟΥ',
    joinRoom: 'ΣΥΜΜΕΤΟΧΗ ΣΕ ΔΩΜΑΤΙΟ',
    noAccount: 'ΧΩΡΙΣ ΛΟΓΑΡΙΑΣΜΟ',
    realPlayers: 'ΠΡΑΓΜΑΤΙΚΟΙ ΠΑΙΚΤΕΣ',
    roomCodes: 'ΚΩΔΙΚΟΙ ΔΩΜΑΤΙΩΝ',
    readySystem: 'ΣΥΣΤΗΜΑ READY',
    roleReveal: 'ΑΠΟΚΑΛΥΨΗ ΡΟΛΟΥ',
    back: 'ΠΙΣΩ',
    joinPrivate: 'ΜΠΕΣ ΣΕ ΔΩΜΑΤΙΟ',
    publicRooms: 'ΔΗΜΟΣΙΟΙ SERVERS',
    noPublicRooms: 'Δεν υπάρχουν ενεργά δωμάτια τώρα.',
    refreshRooms: 'ΑΝΑΝΕΩΣΗ',
    roomName: 'ΟΝΟΜΑ ΔΩΜΑΤΙΟΥ',
    access: 'ΠΡΟΣΒΑΣΗ ΔΩΜΑΤΙΟΥ',
    openRoom: 'ΑΝΟΙΧΤΟ',
    approvalRoom: 'ΕΓΚΡΙΣΗ HOST',
    passwordRoom: 'ΚΩΔΙΚΟΣ',
    roomPassword: 'ΚΩΔΙΚΟΣ ΠΡΟΣΒΑΣΗΣ',
    requestPending: 'Περιμένεις έγκριση από τον host...',
    requestJoin: 'ΑΙΤΗΜΑ ΣΥΜΜΕΤΟΧΗΣ',
    approve: 'ΕΓΚΡΙΣΗ',
    deny: 'ΑΠΟΡΡΙΨΗ',
    joinRequests: 'ΑΙΤΗΜΑΤΑ ΣΥΜΜΕΤΟΧΗΣ',
    wrongPassword: 'Λάθος κωδικός πρόσβασης.',
    enterCode: 'ΒΑΛΕ ΚΩΔΙΚΟ',
    player: 'ΠΑΙΚΤΗΣ',
    spectator: 'ΘΕΑΤΗΣ',
    connecting: 'ΣΥΝΔΕΣΗ...',
    privateRoom: 'ΙΔΙΩΤΙΚΟ ΔΩΜΑΤΙΟ',
    connected: 'ΣΥΝΔΕΔΕΜΕΝΟ',
    room: 'ΔΩΜΑΤΙΟ',
    copyCode: 'ΑΝΤΙΓΡΑΦΗ ΚΩΔΙΚΟΥ',
    players: 'ΠΑΙΚΤΕΣ',
    ready: 'ΕΤΟΙΜΟΣ',
    notReady: 'ΟΧΙ ΕΤΟΙΜΟΣ',
    noPlayers: 'Δεν υπάρχουν παίκτες ακόμα.',
    markReady: 'ΔΗΛΩΣΕ ΕΤΟΙΜΟΣ',
    hostSettings: 'ΡΥΘΜΙΣΕΙΣ HOST',
    roomSettings: 'ΡΥΘΜΙΣΕΙΣ ΔΩΜΑΤΙΟΥ',
    host: 'HOST',
    synced: 'ΣΥΓΧΡΟΝΙΣΜΕΝΟ',
    maxPlayers: 'ΜΕΓΙΣΤΟΙ ΠΑΙΚΤΕΣ',
    maxSpectators: 'ΜΕΓΙΣΤΟΙ ΘΕΑΤΕΣ',
    spectators: 'ΘΕΑΤΕΣ',
    voiceChat: 'ΦΩΝΗΤΙΚΗ ΣΥΝΟΜΙΛΙΑ',
    micReady: 'ΜΙΚΡΟΦΩΝΟ ΕΤΟΙΜΟ',
    optional: 'ΠΡΟΑΙΡΕΤΙΚΟ',
    voiceExplain: 'Ενεργοποίησε το μικρόφωνο για ζωντανή φωνή την ημέρα με τους άλλους ζωντανούς παίκτες.'
    enableMicrophone: 'ΕΝΕΡΓΟΠΟΙΗΣΗ ΜΙΚΡΟΦΩΝΟΥ',
    unmute: 'ΑΝΟΙΓΜΑ ΜΙΚΡΟΦΩΝΟΥ',
    muteMic: 'ΣΙΓΑΣΗ ΜΙΚΡΟΦΩΝΟΥ',
    realPlayer: 'ΠΡΑΓΜΑΤΙΚΟΣ ΠΑΙΚΤΗΣ',
    realPlayersCount: 'ΠΡΑΓΜΑΤΙΚΟΙ ΠΑΙΚΤΕΣ',
    startingIn: 'ΞΕΚΙΝΑΕΙ ΣΕ',
    startGame: 'ΕΝΑΡΞΗ ΠΑΙΧΝΙΔΙΟΥ',
    waitingReady: 'ΑΝΑΜΟΝΗ ΓΙΑ READY',
    waitingHost: 'ΑΝΑΜΟΝΗ ΓΙΑ HOST',
    privateScreen: 'ΑΥΤΗ Η ΟΘΟΝΗ ΕΙΝΑΙ ΙΔΙΩΤΙΚΗ',
    yourRole: 'Ο ΡΟΛΟΣ ΣΟΥ',
    understand: 'ΚΑΤΑΛΑΒΑ — ΜΠΕΣ ΣΤΟ ΠΑΙΧΝΙΔΙ',
    round: 'ΓΥΡΟΣ',
    night: 'ΝΥΧΤΑ',
    day: 'ΜΕΡΑ',
    voting: 'ΨΗΦΟΦΟΡΙΑ',
    citySleeping: 'Η ΠΟΛΗ ΚΟΙΜΑΤΑΙ',
    nightExplain: 'Οι ειδικοί ρόλοι κάνουν τις ενέργειές τους. Οι απλοί πολίτες περιμένουν το πρωί.',
    resolveNight: 'ΟΛΟΚΛΗΡΩΣΗ ΝΥΧΤΑΣ',
    discussion: 'ΣΥΖΗΤΗΣΗ',
    dayExplain: 'Όλοι οι ζωντανοί παίκτες μπορούν να μιλήσουν.',
    startVote: 'ΕΝΑΡΞΗ ΨΗΦΟΦΟΡΙΑΣ',
    castVote: 'ΡΙΞΕ ΤΗΝ ΨΗΦΟ ΣΟΥ',
    skipVote: 'ΠΑΡΑΛΕΙΨΗ ΨΗΦΟΥ',
    lockVote: 'ΚΛΕΙΔΩΜΑ ΨΗΦΟΥ',
    alive: 'ΖΩΝΤΑΝΟΣ',
    voice: 'ΦΩΝΗ',
    muted: 'ΣΙΓΑΣΜΕΝΟ',
    off: 'ΚΛΕΙΣΤΟ',
    enableMic: 'ΕΝΕΡΓΟΠΟΙΗΣΗ MIC',
    mute: 'ΣΙΓΑΣΗ',
    voiceNext: 'Η άδεια μικροφώνου λειτουργεί. Η ζωντανή φωνή στο δωμάτιο είναι το επόμενο βήμα.',
    visibleKiller: 'Φανερός Δολοφόνος',
    hiddenKiller: 'Κρυφός Δολοφόνος',
    detective: 'Ντετέκτιβ',
    doctor: 'Γιατρός',
    lover: 'Ερωτευμένη',
    kamikaze: 'Καμικάζε',
    madness: 'Τρέλα',
    citizen: 'Πολίτης',
    roleVisibleKiller: 'Είσαι ο Φανερός Δολοφόνος. Κάθε νύχτα επιλέγεις ιδιωτικά έναν στόχο. Δεν γνωρίζεις ποιος είναι ο Κρυφός Δολοφόνος ούτε την επιλογή του.',
    roleHiddenKiller: 'Είσαι ο Κρυφός Δολοφόνος. Κάθε νύχτα επιλέγεις ιδιωτικά έναν στόχο. Δεν γνωρίζεις ποιος είναι ο Φανερός Δολοφόνος ούτε την επιλογή του.',
    roleDetective: 'Γνωρίζεις ποιος είναι ο Φανερός Δολοφόνος. Χρησιμοποίησε αυτή την πληροφορία προσεκτικά χωρίς να αποκαλυφθείς.',
    roleDoctor: 'Προστάτεψε έναν παίκτη κάθε βράδυ.',
    roleLover: 'Είσαι δεμένος με έναν άλλο Ερωτευμένο. Αν πεθάνει ένας από τους δύο, πεθαίνει και ο άλλος.',
    roleKamikaze: 'Η εξόντωσή σου μπορεί να προκαλέσει επικίνδυνη συνέπεια.',
    roleMadness: 'Η συνθήκη νίκης σου δεν ακολουθεί τους συνηθισμένους κανόνες.',
    roleCitizen: 'Βρες τους δολοφόνους, επιβίωσε και ψήφισε προσεκτικά.',
    multiplayerLoading: 'Το multiplayer φορτώνει ακόμα. Δοκίμασε ξανά σε ένα δευτερόλεπτο.',
    roomCollision: 'Ο κωδικός δωματίου χρησιμοποιείται ήδη. Δημιούργησε νέο δωμάτιο.',
    roomOpenFail: 'Δεν ήταν δυνατή η δημιουργία του δωματίου.',
    spectatorFull: 'Οι θέσεις θεατών είναι γεμάτες.',
    playerFull: 'Οι θέσεις παικτών είναι γεμάτες.',
    joinFail: 'Δεν ήταν δυνατή η είσοδος στο δωμάτιο.',
    lostHost: 'Η σύνδεση με τον host χάθηκε.',
    connectFail: 'Δεν ήταν δυνατή η σύνδεση σε αυτόν τον κωδικό.',
    micDenied: 'Η άδεια μικροφώνου απορρίφθηκε ή δεν είναι διαθέσιμη.',
    narrator: 'ΑΦΗΓΗΤΗΣ', narratorOn: 'ΕΝΕΡΓΟΣ', narratorOff: 'ΚΛΕΙΣΤΟΣ', narratorHint: 'Τα γεγονότα του παιχνιδιού ακούγονται στη γλώσσα που επέλεξες.',
    narrRole: 'Ο ρόλος σου είναι', knownKiller: 'Ο ΦΑΝΕΡΟΣ ΔΟΛΟΦΟΝΟΣ ΕΙΝΑΙ', narrNight: 'Μια νύχτα πέφτει στο Παλέρμο.', narrDay: 'Η μέρα ξημερώνει στο Παλέρμο. Ώρα για συζήτηση.', narrVote: 'Η ψηφοφορία ξεκίνησε. Διάλεξε προσεκτικά.',
    reportBug: 'ΑΝΑΦΟΡΑ BUG',
    reportBugTitle: 'ΑΝΑΦΟΡΑ BUG',
    bugCategory: 'ΤΥΠΟΣ ΠΡΟΒΛΗΜΑΤΟΣ',
    bugDescription: 'ΤΙ ΣΥΝΕΒΗ;',
    bugGameplay: 'Gameplay',
    bugMultiplayer: 'Multiplayer',
    bugUi: 'Interface',
    bugAudio: 'Ήχος / Αφηγητής',
    bugOther: 'Άλλο',
    bugPlaceholder: 'Πες μας τι συνέβη και τι περίμενες να γίνει.',
    bugSubmit: 'ΑΠΟΣΤΟΛΗ',
    bugCancel: 'ΑΚΥΡΩΣΗ',
    bugSending: 'ΑΠΟΣΤΟΛΗ...',
    bugThanks: 'Ευχαριστούμε — η αναφορά στάλθηκε.',
    bugFailed: 'Δεν ήταν δυνατή η αποστολή. Δοκίμασε ξανά.',
    gameOver: 'ΤΕΛΟΣ ΠΑΙΧΝΙΔΙΟΥ',
    endGame: 'ΤΕΛΟΣ ΠΑΙΧΝΙΔΙΟΥ',
    whatNext: 'ΤΙ ΘΕΛΕΙΣ ΝΑ ΚΑΝΕΙΣ;',
    playAgain: 'ΠΑΙΞΕ ΞΑΝΑ',
    playAgainHint: 'Νέο δωμάτιο, ίδιοι κανόνες, ίδιος host.',
    newSession: 'ΝΕΟ SESSION',
    newSessionHint: 'Νέο δωμάτιο, ίδιοι κανόνες, τυχαίος host.',
    leaveGame: 'ΕΞΟΔΟΣ',
    leaveGameHint: 'Επιστροφή στους servers.',
    preparingSession: 'ΠΡΟΕΤΟΙΜΑΣΙΑ ΝΕΟΥ SESSION...',
    dead: 'ΝΕΚΡΟΣ',
    spectatorOnly: 'ΜΟΝΟ ΘΕΑΤΗΣ',
    spectatorChat: 'CHAT ΘΕΑΤΩΝ',
    spectatorChatHint: 'Μόνο νεκροί παίκτες και θεατές βλέπουν αυτά τα μηνύματα.',
    send: 'ΑΠΟΣΤΟΛΗ',
    madnessWins: 'Η ΤΡΕΛΑ ΝΙΚΑ',
    citizensWin: 'ΟΙ ΠΟΛΙΤΕΣ ΝΙΚΟΥΝ',
    killersWin: 'ΟΙ ΔΟΛΟΦΟΝΟΙ ΝΙΚΟΥΝ',
    mvp: 'MVP',
    allRoles: 'ΟΛΟΙ ΟΙ ΡΟΛΟΙ',
    dayChat: 'CHAT ΗΜΕΡΑΣ',
    dayChatHint: 'Οι ζωντανοί παίκτες μπορούν να μιλούν και να γράφουν για δύο λεπτά.',
    voteTime: 'ΩΡΑ ΓΙΑ ΨΗΦΟ',
    eliminated: 'αποχώρησε από το παιχνίδι. Ο ρόλος ήταν',
    noElimination: 'Κανένας παίκτης δεν αποχώρησε.',
    nightDeath: 'δεν επέζησε από τη νύχτα.',
    nightSafe: 'Κανένας δεν πέθανε κατά τη διάρκεια της νύχτας.',
    playerLeftAbort: 'Ένας παίκτης αποχώρησε. Το παιχνίδι ακυρώθηκε και όλοι επέστρεψαν στο lobby.',
    hostLeftAbort: 'Ο host αποχώρησε. Το παιχνίδι έκλεισε.',
    kamikazeAction: 'ΚΑΜΙΚΑΖΙ',
    kamikazeChoose: 'Διάλεξε έναν παίκτη να πάρεις μαζί σου. Μπορεί να χρησιμοποιηθεί μόνο μία φορά μέσα στη μέρα.',
    kamikazeUsed: 'Η ΒΟΜΒΑ ΧΡΗΣΙΜΟΠΟΙΗΘΗΚΕ',
    kamikazeBoom: 'ανατινάχτηκε και πήρε μαζί του τον/την',
    music: 'ΜΟΥΣΙΚΗ MENU',
    musicOn: 'ON',
    musicOff: 'OFF',
    madeBy: 'Δημιουργήθηκε από'
  }
}

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function shuffle(items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function PalermoClient() {
  const [screen, setScreen] = useState('language')
  const [lang, setLang] = useState('en')
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [joinMode, setJoinMode] = useState('player')
  const [isHost, setIsHost] = useState(false)
  const [players, setPlayers] = useState([])
  const [spectators, setSpectators] = useState([])
  const [maxPlayers, setMaxPlayers] = useState(10)
  const [maxSpectators, setMaxSpectators] = useState(4)
  const [roles, setRoles] = useState(DEFAULT_ROLES)
  const [ready, setReady] = useState(false)
  const [connectionState, setConnectionState] = useState('idle')
  const [connectionError, setConnectionError] = useState('')
  const [countdown, setCountdown] = useState(null)
  const [myRole, setMyRole] = useState(null)
  const [phase, setPhase] = useState('night')
  const [round, setRound] = useState(1)
  const [discussion, setDiscussion] = useState(180)
  const [vote, setVote] = useState('')
  const [micState, setMicState] = useState('idle')
  const [micError, setMicError] = useState('')
  const [muted, setMuted] = useState(false)
  const [narratorOn, setNarratorOn] = useState(true)
  const [roomName, setRoomName] = useState('')
  const [accessMode, setAccessMode] = useState('open')
  const [accessCode, setAccessCode] = useState('')
  const [joinAccessCode, setJoinAccessCode] = useState('')
  const [publicRooms, setPublicRooms] = useState([])
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [pendingRequests, setPendingRequests] = useState([])
  const [joinPending, setJoinPending] = useState(false)
  const [bugOpen, setBugOpen] = useState(false)
  const [bugCategory, setBugCategory] = useState('gameplay')
  const [bugDescription, setBugDescription] = useState('')
  const [bugStatus, setBugStatus] = useState('idle')
  const [nightTimer, setNightTimer] = useState(15)
  const [killerVote, setKillerVote] = useState('')
  const [killerVotes, setKillerVotes] = useState({})
  const [nightResolvedTarget, setNightResolvedTarget] = useState('')
  const [doctorVote, setDoctorVote] = useState('')
  const [doctorProtected, setDoctorProtected] = useState('')
  const [nightSaved, setNightSaved] = useState(false)
  const [sessionTransitioning, setSessionTransitioning] = useState(false)
  const [gameRoster, setGameRoster] = useState([])
  const [playerVotes, setPlayerVotes] = useState({})
  const [voteScores, setVoteScores] = useState({})
  const [isDead, setIsDead] = useState(false)
  const [spectatorMessages, setSpectatorMessages] = useState([])
  const [spectatorText, setSpectatorText] = useState('')
  const [gameWinner, setGameWinner] = useState('')
  const [gameMvp, setGameMvp] = useState('')
  const [voteTimer, setVoteTimer] = useState(30)
  const [dayMessages, setDayMessages] = useState([])
  const [dayText, setDayText] = useState('')
  const [menuMusicOn, setMenuMusicOn] = useState(true)
  const [kamikazeUsed, setKamikazeUsed] = useState(false)

  const peerRef = useRef(null)
  const hostConnRef = useRef(null)
  const guestConnsRef = useRef(new Map())
  const pendingJoinConnsRef = useRef(new Map())
  const streamRef = useRef(null)
  const voiceCallsRef = useRef(new Map())
  const remoteAudioRef = useRef(new Map())
  const playersRef = useRef([])
  const mutedRef = useRef(false)
  const isDeadRef = useRef(false)
  const sessionRejoinTokenRef = useRef('')
  const registryTokenRef = useRef('')
  const menuAudioRef = useRef(null)
  const playerVotesRef = useRef({})
  const killerVotesRef = useRef({})
  const doctorProtectedRef = useRef('')
  const gameRosterRef = useRef([])
  const phaseRef = useRef('night')
  const spectatorsRef = useRef([])
  const screenRef = useRef('language')
  const kamikazeUsedRef = useRef(new Set())
  const t = key => TEXT[lang]?.[key] ?? TEXT.en[key] ?? key
  const roleName = role => t(role?.id || 'citizen')
  const chooseLanguage = value => { setLang(value); setScreen('home'); if (menuMusicOn) startMenuMusic() }

  function startMenuMusic() {
    if (!menuMusicOn || typeof window === 'undefined' || menuAudioRef.current) return
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const master = ctx.createGain()
      master.gain.value = 0.035
      master.connect(ctx.destination)

      const freqs = [55, 82.41, 110]
      const oscs = freqs.map((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = i === 0 ? 'sine' : 'triangle'
        osc.frequency.value = freq
        gain.gain.value = i === 0 ? 0.75 : 0.28
        osc.connect(gain)
        gain.connect(master)
        osc.start()
        return osc
      })

      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.frequency.value = 0.08
      lfoGain.gain.value = 0.015
      lfo.connect(lfoGain)
      lfoGain.connect(master.gain)
      lfo.start()

      menuAudioRef.current = { ctx, oscs, lfo }
    } catch {}
  }

  function stopMenuMusic() {
    const audio = menuAudioRef.current
    if (!audio) return
    try {
      audio.oscs?.forEach(o => o.stop())
      audio.lfo?.stop()
      audio.ctx?.close()
    } catch {}
    menuAudioRef.current = null
  }

  function toggleMenuMusic() {
    setMenuMusicOn(current => {
      const next = !current
      if (next) setTimeout(startMenuMusic, 0)
      else stopMenuMusic()
      return next
    })
  }

  function speak(text) {
    if (!narratorOn || typeof window === 'undefined' || !('speechSynthesis' in window) || !text) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang === 'el' ? 'el-GR' : 'en-US'
    const voices = window.speechSynthesis.getVoices?.() || []
    const preferred = voices.find(v => v.lang?.toLowerCase().startsWith(lang === 'el' ? 'el' : 'en'))
    if (preferred) utterance.voice = preferred
    utterance.rate = 0.95
    utterance.pitch = 1
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => { gameRosterRef.current = gameRoster }, [gameRoster])
  useEffect(() => { playersRef.current = players }, [players])
  useEffect(() => { mutedRef.current = muted }, [muted])
  useEffect(() => { isDeadRef.current = isDead }, [isDead])
  useEffect(() => { phaseRef.current = phase }, [phase])
  useEffect(() => { spectatorsRef.current = spectators }, [spectators])
  useEffect(() => { screenRef.current = screen }, [screen])

  useEffect(() => {
    const existing = document.querySelector('script[data-peerjs]')
    if (existing) return
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/peerjs@1.5.5/dist/peerjs.min.js'
    script.async = true
    script.dataset.peerjs = 'true'
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (screen !== 'game' || phase !== 'night') return
    setNightTimer(15)
    setKillerVote('')
    setDoctorVote('')
    setNightResolvedTarget('')
    setNightSaved(false)
    if (isHost) {
      setKillerVotes({})
      killerVotesRef.current = {}
      setDoctorProtected('')
      doctorProtectedRef.current = ''
    }
    const timer = setInterval(() => {
      setNightTimer(v => {
        if (v <= 1) {
          clearInterval(timer)
          if (isHost) setTimeout(() => resolveKillerVotes(killerVotesRef.current, doctorProtectedRef.current), 0)
          return 0
        }
        return v - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [screen, phase, round])

  useEffect(() => {
    if (micState === 'granted') {
      ensureVoiceCalls()
      updateVoiceGate()
    }
  }, [micState, players, screen, phase, isDead, muted, gameRoster])

  useEffect(() => {
    if (screen === 'home' && menuMusicOn) startMenuMusic()
    if (screen !== 'home') stopMenuMusic()
  }, [screen, menuMusicOn])

  useEffect(() => {
    if (screen !== 'game' || phase !== 'day') return
    setDiscussion(120)
    const timer = setInterval(() => {
      setDiscussion(v => {
        if (v <= 1) {
          clearInterval(timer)
          if (isHost) {
            setPhase('vote')
            setVoteTimer(30)
            setPlayerVotes({})
            playerVotesRef.current = {}
            setVote('')
            broadcast({ type: 'phase-change', phase: 'vote', round })
          }
          return 0
        }
        return v - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [screen, phase, round, isHost])

  useEffect(() => {
    if (screen !== 'game' || phase !== 'vote') return
    setVoteTimer(30)
    const timer = setInterval(() => {
      setVoteTimer(v => {
        if (v <= 1) {
          clearInterval(timer)
          if (isHost) resolveDayVote(playerVotesRef.current)
          return 0
        }
        return v - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [screen, phase, round, isHost])

  useEffect(() => {
    if (screen === 'role' && myRole) speak(`${t('narrRole')} ${roleName(myRole)}.`)
  }, [screen, myRole, lang, narratorOn])

  useEffect(() => {
    if (screen !== 'game') return
    if (phase === 'night') speak(t('narrNight'))
    if (phase === 'day') {
      const morning = nightResolvedTarget ? `${nightResolvedTarget} ${t('nightDeath')}` : t('nightSafe')
      speak(`${t('narrDay')} ${morning}`)
    }
    if (phase === 'vote') speak(t('narrVote'))
  }, [screen, phase, round, lang, narratorOn])

  useEffect(() => {
    if (screen !== 'join') return
    let cancelled = false
    const load = async () => {
      setRoomsLoading(true)
      try {
        const rooms = await fetchPublicRooms()
        if (!cancelled) setPublicRooms(rooms)
      } catch {
        if (!cancelled) setPublicRooms([])
      } finally {
        if (!cancelled) setRoomsLoading(false)
      }
    }
    load()
    const timer = setInterval(load, 5000)
    return () => { cancelled = true; clearInterval(timer) }
  }, [screen])

  useEffect(() => {
    if (!isHost || !roomCode || !['lobby','role','game'].includes(screen)) return
    const sync = async () => {
      try {
        await writeRoomRegistry({
          room_code: roomCode,
          room_name: (roomName.trim() || `${name.trim()}'s Room`).slice(0, 40),
          host_name: name.trim().slice(0,18),
          language: lang,
          access_mode: accessMode,
          player_count: players.length,
          max_players: maxPlayers,
          spectator_count: spectators.length,
          max_spectators: maxSpectators,
          narrator_enabled: narratorOn,
          started: screen === 'role' || screen === 'game',
          heartbeat_at: new Date().toISOString(),
        }, registryTokenRef.current, true)
      } catch {}
    }
    sync()
    const timer = setInterval(sync, 20000)
    return () => clearInterval(timer)
  }, [isHost, roomCode, screen, roomName, name, lang, accessMode, players.length, maxPlayers, spectators.length, maxSpectators, narratorOn])

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel?.()
      peerRef.current?.destroy?.()
      closeAllVoice()
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      stopMenuMusic()
    }
  }, [])

  function stopRemoteAudio(peerId) {
    const audio = remoteAudioRef.current.get(peerId)
    if (audio) {
      try { audio.pause(); audio.srcObject = null } catch {}
      remoteAudioRef.current.delete(peerId)
    }
  }

  function closeVoiceCall(peerId) {
    const call = voiceCallsRef.current.get(peerId)
    if (call) {
      try { call.close() } catch {}
      voiceCallsRef.current.delete(peerId)
    }
    stopRemoteAudio(peerId)
  }

  function attachVoiceCall(call) {
    if (!call?.peer) return
    const peerId = call.peer
    const existing = voiceCallsRef.current.get(peerId)
    if (existing && existing !== call) {
      try { call.close() } catch {}
      return
    }
    voiceCallsRef.current.set(peerId, call)

    call.on('stream', remoteStream => {
      let audio = remoteAudioRef.current.get(peerId)
      if (!audio) {
        audio = new Audio()
        audio.autoplay = true
        audio.playsInline = true
        remoteAudioRef.current.set(peerId, audio)
      }
      audio.srcObject = remoteStream
      updateVoiceGate()
    })

    call.on('close', () => {
      if (voiceCallsRef.current.get(peerId) === call) voiceCallsRef.current.delete(peerId)
      stopRemoteAudio(peerId)
    })
    call.on('error', () => {
      if (voiceCallsRef.current.get(peerId) === call) voiceCallsRef.current.delete(peerId)
      stopRemoteAudio(peerId)
    })
  }

  function handleIncomingVoiceCall(call) {
    const allowed = playersRef.current.some(p => p.id === call.peer)
    if (!allowed) {
      try { call.close() } catch {}
      return
    }
    if (voiceCallsRef.current.has(call.peer)) {
      try { call.close() } catch {}
      return
    }
    try {
      call.answer(streamRef.current || undefined)
      attachVoiceCall(call)
    } catch {
      try { call.close() } catch {}
    }
  }

  function ensureVoiceCalls() {
    const peer = peerRef.current
    const stream = streamRef.current
    if (!peer?.id || !stream) return

    playersRef.current.forEach(player => {
      if (!player?.id || player.id === peer.id) return
      if (voiceCallsRef.current.has(player.id)) return

      // Only one side initiates each two-way media call, preventing doubled audio.
      if (String(peer.id).localeCompare(String(player.id)) >= 0) return

      try {
        const call = peer.call(player.id, stream, { metadata: { kind: 'palermo-voice' } })
        if (call) attachVoiceCall(call)
      } catch {}
    })
  }

  function updateVoiceGate() {
    const localId = peerRef.current?.id
    const roster = gameRosterRef.current
    const me = roster.find(p => p.id === localId)
    const dayOpen = screenRef.current === 'game' && phaseRef.current === 'day' && !!me?.alive
    const transmit = dayOpen && !mutedRef.current && !isDeadRef.current

    streamRef.current?.getAudioTracks?.().forEach(track => {
      track.enabled = transmit
    })

    remoteAudioRef.current.forEach((audio, peerId) => {
      const remoteAlive = roster.some(p => p.id === peerId && p.alive)
      const shouldHear = dayOpen && remoteAlive
      try {
        audio.muted = !shouldHear
        audio.volume = shouldHear ? 1 : 0
        if (shouldHear) audio.play().catch(() => {})
        else audio.pause()
      } catch {}
    })
  }

  function closeAllVoice() {
    voiceCallsRef.current.forEach(call => { try { call.close() } catch {} })
    voiceCallsRef.current.clear()
    remoteAudioRef.current.forEach(audio => {
      try { audio.pause(); audio.srcObject = null } catch {}
    })
    remoteAudioRef.current.clear()
  }

  function getPeer() {
    return window.Peer
  }

  function roomPeerId(code) {
    return 'palermo-room-' + code.toLowerCase()
  }

  function broadcast(payload) {
    guestConnsRef.current.forEach(conn => {
      if (conn?.open) conn.send(payload)
    })
  }

  function broadcastState(nextPlayers = players, nextSpectators = spectators, extra = {}) {
    broadcast({
      type: 'room-state',
      players: nextPlayers,
      spectators: nextSpectators,
      maxPlayers,
      maxSpectators,
      roles,
      ...extra,
    })
  }

  function admitGuest(conn, data) {
    const entry = {
      id: conn.peer,
      name: String(data.name || 'Player').slice(0, 18),
      ready: false,
      isHost: false,
    }

    if (data.mode === 'spectator') {
      setSpectators(current => {
        if (current.length >= maxSpectators) {
          conn.send({ type: 'join-error', message: t('spectatorFull') })
          return current
        }
        const next = [...current.filter(p => p.id !== conn.peer), entry]
        conn.send({ type: 'join-approved' })
        setTimeout(() => broadcastState(players, next), 0)
        return next
      })
    } else {
      setPlayers(current => {
        if (current.length >= maxPlayers) {
          conn.send({ type: 'join-error', message: t('playerFull') })
          return current
        }
        const next = [...current.filter(p => p.id !== conn.peer), entry]
        conn.send({ type: 'join-approved' })
        setTimeout(() => broadcastState(next, spectators), 0)
        return next
      })
    }
  }

  function decideJoin(peerId, approved) {
    const pending = pendingJoinConnsRef.current.get(peerId)
    if (!pending) return
    pendingJoinConnsRef.current.delete(peerId)
    setPendingRequests(current => current.filter(r => r.peerId !== peerId))
    if (approved) admitGuest(pending.conn, pending.data)
    else pending.conn.send({ type: 'join-error', message: lang === 'el' ? 'Ο host απέρριψε το αίτημα.' : 'The host denied the request.' })
  }

  function resetMatchStateForLobby() {
    setMyRole(null)
    setPhase('night')
    phaseRef.current = 'night'
    setRound(1)
    setVote('')
    setPlayerVotes({})
    playerVotesRef.current = {}
    setVoteScores({})
    setKillerVotes({})
    killerVotesRef.current = {}
    setDoctorProtected('')
    doctorProtectedRef.current = ''
    setDoctorVote('')
    setKillerVote('')
    setNightResolvedTarget('')
    setNightSaved(false)
    setKamikazeUsed(false)
    kamikazeUsedRef.current = new Set()
    setIsDead(false)
    setDayMessages([])
    setSpectatorMessages([])
    setGameWinner('')
    setGameMvp('')
    setCountdown(null)
    setDiscussion(120)
    setVoteTimer(30)
    setReady(false)
    setGameRoster([])
    gameRosterRef.current = []
    setTimeout(updateVoiceGate, 0)
  }

  function abortMatchToLobby(leaverPeerId = '') {
    if (!isHost) return
    resetMatchStateForLobby()
    setPlayers(current => {
      const next = current
        .filter(p => p.id !== leaverPeerId)
        .map(p => ({ ...p, ready: false }))
      setTimeout(() => {
        broadcast({
          type: 'game-aborted',
          reason: 'player-left',
          players: next,
          spectators: spectatorsRef.current,
          maxPlayers,
          maxSpectators,
          roles,
        })
      }, 0)
      return next
    })
    setScreen('lobby')
    screenRef.current = 'lobby'
    writeRoomRegistry({
      room_code: roomCode,
      room_name: (roomName.trim() || `${name.trim()}'s Room`).slice(0,40),
      host_name: name.trim().slice(0,18),
      language: lang,
      access_mode: accessMode,
      player_count: Math.max(1, players.length - (leaverPeerId ? 1 : 0)),
      max_players: maxPlayers,
      spectator_count: spectatorsRef.current.length,
      max_spectators: maxSpectators,
      narrator_enabled: narratorOn,
      started: false,
    }, registryTokenRef.current, true).catch(() => {})
  }

  function setupHostConnection(conn) {
    guestConnsRef.current.set(conn.peer, conn)

    conn.on('data', data => {
      if (!data || typeof data !== 'object') return

      if (data.type === 'session-rejoin') {
        if (!sessionRejoinTokenRef.current || data.token !== sessionRejoinTokenRef.current) {
          conn.send({ type: 'join-error', message: t('joinFail') })
          return
        }
        admitGuest(conn, { name: data.name, mode: data.mode || 'player' })
        return
      }

      if (data.type === 'join') {
        if (accessMode === 'code' && String(data.accessCode || '') !== accessCode) {
          conn.send({ type: 'join-error', message: t('wrongPassword') })
          return
        }

        if (accessMode === 'request') {
          pendingJoinConnsRef.current.set(conn.peer, { conn, data })
          setPendingRequests(current => [
            ...current.filter(r => r.peerId !== conn.peer),
            {
              peerId: conn.peer,
              name: String(data.name || 'Player').slice(0, 18),
              mode: data.mode === 'spectator' ? 'spectator' : 'player',
            }
          ])
          conn.send({ type: 'join-pending' })
          return
        }

        admitGuest(conn, data)
      }

      if (data.type === 'killer-vote') {
        const actor = gameRosterRef.current.find(p => p.id === conn.peer)
        if (actor?.alive && (actor.roleId === 'visibleKiller' || actor.roleId === 'hiddenKiller')) {
          const target = String(data.target || '')
          killerVotesRef.current = { ...killerVotesRef.current, [conn.peer]: target }
          setKillerVotes(killerVotesRef.current)
        }
      }

      if (data.type === 'doctor-vote') {
        const actor = gameRosterRef.current.find(p => p.id === conn.peer)
        if (actor?.alive && actor.roleId === 'doctor') {
          const target = String(data.target || '')
          doctorProtectedRef.current = target
          setDoctorProtected(target)
        }
      }

      if (data.type === 'player-vote') {
        registerDayVote(conn.peer, String(data.target || ''))
      }

      if (data.type === 'spectator-chat') {
        sendSpectatorMessage(String(data.text || ''), conn.peer)
      }

      if (data.type === 'day-chat') {
        sendDayMessage(String(data.text || ''), conn.peer)
      }

      if (data.type === 'kamikaze-action') {
        resolveKamikazeAction(conn.peer, String(data.target || ''))
      }

      if (data.type === 'ready') {
        setPlayers(current => {
          const next = current.map(p => p.id === conn.peer ? { ...p, ready: !!data.ready } : p)
          setTimeout(() => broadcastState(next, spectators), 0)
          return next
        })
      }
    })

    conn.on('close', () => {
      closeVoiceCall(conn.peer)
      const wasActivePlayer = gameRosterRef.current.some(p => p.id === conn.peer)
      const matchRunning = screenRef.current === 'role' || screenRef.current === 'game'

      guestConnsRef.current.delete(conn.peer)
      pendingJoinConnsRef.current.delete(conn.peer)
      setPendingRequests(current => current.filter(r => r.peerId !== conn.peer))

      if (matchRunning && wasActivePlayer) {
        abortMatchToLobby(conn.peer)
        return
      }

      setPlayers(current => {
        const next = current.filter(p => p.id !== conn.peer)
        setTimeout(() => broadcastState(next, spectatorsRef.current), 0)
        return next
      })
      setSpectators(current => {
        const next = current.filter(p => p.id !== conn.peer)
        spectatorsRef.current = next
        setTimeout(() => broadcastState(players, next), 0)
        return next
      })
    })
  }

  function createRoom() {
    if (!name.trim()) return
    const Peer = getPeer()
    if (!Peer) {
      setConnectionError(t('multiplayerLoading'))
      return
    }

    const code = randomCode()
    registryTokenRef.current = `${crypto.randomUUID()}${crypto.randomUUID()}`
    setRoomCode(code)
    setIsHost(true)
    setConnectionState('connecting')
    setConnectionError('')

    const peer = new Peer(roomPeerId(code))
    peerRef.current = peer
    peer.on('call', handleIncomingVoiceCall)

    peer.on('open', id => {
      const hostPlayer = { id, name: name.trim().slice(0,18), ready: false, isHost: true }
      writeRoomRegistry({
        room_code: code,
        room_name: (roomName.trim() || `${name.trim()}'s Room`).slice(0,40),
        host_name: name.trim().slice(0,18),
        language: lang,
        access_mode: accessMode,
        player_count: 1,
        max_players: maxPlayers,
        spectator_count: 0,
        max_spectators: maxSpectators,
        narrator_enabled: narratorOn,
        started: false,
      }, registryTokenRef.current, false).catch(() => {})
      setPlayers([hostPlayer])
      setSpectators([])
      setConnectionState('connected')
      setScreen('lobby')
    })

    peer.on('connection', setupHostConnection)
    peer.on('error', err => {
      setConnectionState('error')
      setConnectionError(err?.type === 'unavailable-id' ? t('roomCollision') : t('roomOpenFail'))
    })
  }

  function joinRoom() {
    if (!name.trim() || !joinCode.trim()) return
    const Peer = getPeer()
    if (!Peer) {
      setConnectionError('Multiplayer is still loading. Try again in a second.')
      return
    }

    const code = joinCode.trim().toUpperCase()
    setRoomCode(code)
    setIsHost(false)
    setConnectionState('connecting')
    setConnectionError('')

    const peer = new Peer()
    peerRef.current = peer
    peer.on('call', handleIncomingVoiceCall)

    peer.on('open', () => {
      const conn = peer.connect(roomPeerId(code), { reliable: true })
      hostConnRef.current = conn

      conn.on('open', () => {
        conn.send({ type: 'join', name: name.trim(), mode: joinMode, accessCode: joinAccessCode })
        setJoinPending(true)
        setConnectionState('waiting')
      })

      conn.on('data', data => {
        if (!data || typeof data !== 'object') return
        if (data.type === 'join-pending') {
          setJoinPending(true)
          setConnectionState('waiting')
        }
        if (data.type === 'join-approved') {
          setJoinPending(false)
          setConnectionState('connected')
          setScreen('lobby')
        }
        if (data.type === 'room-state') {
          setPlayers(data.players || [])
          setSpectators(data.spectators || [])
          setMaxPlayers(data.maxPlayers ?? 10)
          setMaxSpectators(data.maxSpectators ?? 4)
          setRoles(data.roles || DEFAULT_ROLES)
        }
        if (data.type === 'join-error') {
          setJoinPending(false)
          setConnectionError(data.message || t('joinFail'))
          setConnectionState('error')
        }
        if (data.type === 'countdown') setCountdown(data.value)
        if (data.type === 'game-start') {
          setMyRole(data.role)
          setPhase('night')
          setRound(1)
          setCountdown(null)
          setScreen('role')
        }
        if (data.type === 'night-result') {
          setNightResolvedTarget(data.target || '')
          setNightSaved(!!data.saved)
        }
        if (data.type === 'game-state') {
          setGameRoster(data.roster || [])
        }
        if (data.type === 'eliminated') {
          setIsDead(true)
        }
        if (data.type === 'spectator-chat') {
          setSpectatorMessages(current => [...current.slice(-49), data.message])
        }
        if (data.type === 'day-chat') {
          setDayMessages(current => [...current.slice(-79), data.message])
        }
        if (data.type === 'kamikaze-used') {
          setKamikazeUsed(true)
        }
        if (data.type === 'kamikaze-result') {
          speak(`${data.kamikaze} ${t('kamikazeBoom')} ${data.target}.`)
        }
        if (data.type === 'vote-result') {
          if (data.name && data.roleLabel) {
            speak(`${data.name} ${t('eliminated')} ${data.roleLabel}.`)
          } else {
            speak(t('noElimination'))
          }
        }
        if (data.type === 'game-over') {
          setGameWinner(data.winner || '')
          setGameMvp(data.mvp || '')
          if (Array.isArray(data.roster)) setGameRoster(data.roster)
          setScreen('gameOver')
        }
        if (data.type === 'session-transition') {
          transitionToFreshSession(data)
        }
        if (data.type === 'return-browser') {
          leaveToBrowser(false)
        }
        if (data.type === 'game-aborted') {
          resetMatchStateForLobby()
          setPlayers((data.players || []).map(p => ({ ...p, ready: false })))
          setSpectators(data.spectators || [])
          setMaxPlayers(data.maxPlayers ?? maxPlayers)
          setMaxSpectators(data.maxSpectators ?? maxSpectators)
          setRoles(data.roles || roles)
          setConnectionError(t('playerLeftAbort'))
          setConnectionState('connected')
          setScreen('lobby')
          screenRef.current = 'lobby'
        }
        if (data.type === 'phase-change') {
          setPhase(data.phase || 'night')
          setRound(data.round || 1)
          if (data.phase === 'day') setDiscussion(180)
          if (data.phase !== 'vote') setVote('')
        }
      })

      conn.on('close', () => {
        closeAllVoice()
        const matchRunning = screenRef.current === 'role' || screenRef.current === 'game'
        if (matchRunning) {
          resetMatchStateForLobby()
          peerRef.current?.destroy?.()
          hostConnRef.current = null
          setRoomCode('')
          setJoinCode('')
          setPlayers([])
          setSpectators([])
          setIsHost(false)
          setConnectionState('idle')
          setConnectionError(t('hostLeftAbort'))
          setScreen('home')
          screenRef.current = 'home'
          return
        }
        setConnectionState('error')
        setConnectionError(t('lostHost'))
      })

      conn.on('error', () => {
        setConnectionState('error')
        setConnectionError(t('connectFail'))
      })
    })
  }

  function toggleReady() {
    const nextReady = !ready
    setReady(nextReady)

    if (isHost) {
      setPlayers(current => {
        const next = current.map(p => p.isHost ? { ...p, ready: nextReady } : p)
        setTimeout(() => broadcastState(next, spectators), 0)
        return next
      })
    } else {
      hostConnRef.current?.send({ type: 'ready', ready: nextReady })
    }
  }

  function changeRole(id, delta) {
    if (!isHost) return
    setRoles(current => {
      const next = current.map(role => {
        if (role.id !== id) return role
        if (id === 'lover') {
          const count = delta > 0 ? 2 : 0
          return { ...role, count }
        }
        return { ...role, count: Math.max(role.min, Math.min(4, role.count + delta)) }
      })
      setTimeout(() => broadcast({ type:'room-state', players, spectators, maxPlayers, maxSpectators, roles: next }), 0)
      return next
    })
  }

  function changeMaxPlayers(value) {
    const next = Number(value)
    setMaxPlayers(next)
    setTimeout(() => broadcast({ type:'room-state', players, spectators, maxPlayers: next, maxSpectators, roles }), 0)
  }

  function changeMaxSpectators(value) {
    const next = Number(value)
    setMaxSpectators(next)
    setTimeout(() => broadcast({ type:'room-state', players, spectators, maxPlayers, maxSpectators: next, roles }), 0)
  }

  function startGame() {
    const configuredRoleSlots = roles.reduce((sum, role) => sum + role.count, 0)
    if (!isHost || players.length < 2 || !players.every(p => p.ready) || configuredRoleSlots > players.length) return

    let value = 5
    setCountdown(value)
    broadcast({ type: 'countdown', value })

    const timer = setInterval(() => {
      value -= 1
      setCountdown(value)
      broadcast({ type: 'countdown', value })

      if (value <= 0) {
        clearInterval(timer)

        let pool = roles.flatMap(role => Array(role.count).fill(role))
        while (pool.length < players.length) pool.push(citizen)
        pool = shuffle(pool).slice(0, players.length)

        const assigned = players.map((player, index) => ({
          player,
          role: pool[index] || citizen,
        }))
        const visibleKillerPlayer = assigned.find(entry => entry.role.id === 'visibleKiller')?.player
        const loverPlayers = assigned.filter(entry => entry.role.id === 'lover').map(entry => entry.player)
        const roster = assigned.map(({ player, role }) => ({
          id: player.id,
          name: player.name,
          roleId: role.id,
          alive: true,
        }))
        setGameRoster(roster)
        gameRosterRef.current = roster
        setPlayerVotes({})
        setVoteScores({})
        setIsDead(false)
        setGameWinner('')
        setGameMvp('')
        setKamikazeUsed(false)
        kamikazeUsedRef.current = new Set()
        setDayMessages([])
        setVoteTimer(30)
        broadcast({ type: 'game-state', roster: publicRoster(roster) })

        assigned.forEach(({ player, role }) => {
          let privateRole = role.id === 'detective' && visibleKillerPlayer
            ? { ...role, knownVisibleKiller: visibleKillerPlayer.name }
            : role
          if (role.id === 'lover' && loverPlayers.length >= 2) {
            const partner = loverPlayers.find(p => p.id !== player.id)
            if (partner) privateRole = { ...privateRole, loverPartner: partner.name }
          }

          if (player.isHost) {
            setMyRole(privateRole)
          } else {
            guestConnsRef.current.get(player.id)?.send({ type: 'game-start', role: privateRole })
          }
        })

        setPhase('night')
        setRound(1)
        setCountdown(null)
        setScreen('role')
      }
    }, 1000)
  }

  async function requestMic() {
    setMicError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      closeAllVoice()
      streamRef.current?.getTracks?.().forEach(track => track.stop())
      streamRef.current = stream
      mutedRef.current = false
      setMicState('granted')
      setMuted(false)
      setTimeout(() => {
        ensureVoiceCalls()
        updateVoiceGate()
      }, 0)
    } catch {
      setMicState('denied')
      setMicError(t('micDenied'))
    }
  }

  async function submitBugReport() {
    const description = bugDescription.trim()
    if (description.length < 3 || bugStatus === 'sending') return
    setBugStatus('sending')
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/palermo_bug_reports`, {
        method: 'POST',
        headers: { ...REGISTRY_HEADERS, Prefer: 'return=minimal' },
        body: JSON.stringify({
          category: bugCategory,
          description: description.slice(0, 1000),
          screen,
          room_code: roomCode || null,
          player_name: name.trim().slice(0, 18) || null,
          language: lang,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 500) : null,
        }),
      })
      if (!res.ok) throw new Error('bug_report_failed')
      setBugStatus('sent')
      setBugDescription('')
      setTimeout(() => {
        setBugOpen(false)
        setBugStatus('idle')
      }, 1400)
    } catch {
      setBugStatus('error')
    }
  }

  function toggleMute() {
    const stream = streamRef.current
    if (!stream) return
    const next = !muted
    mutedRef.current = next
    setMuted(next)
    updateVoiceGate()
  }

  function submitKillerVote(target) {
    if (!target || phase !== 'night' || isDead) return
    setKillerVote(target)
    if (isHost) {
      const myPeerId = peerRef.current?.id
      if (myPeerId) {
        killerVotesRef.current = { ...killerVotesRef.current, [myPeerId]: target }
        setKillerVotes(killerVotesRef.current)
      }
    } else {
      hostConnRef.current?.send({ type: 'killer-vote', target })
    }
  }

  function submitDoctorVote(target) {
    if (!target || phase !== 'night' || isDead) return
    setDoctorVote(target)
    if (isHost) {
      doctorProtectedRef.current = target
      setDoctorProtected(target)
    } else {
      hostConnRef.current?.send({ type: 'doctor-vote', target })
    }
  }

  function publicRoster(roster) {
    return roster.map(({ id, name, alive }) => ({ id, name, alive }))
  }

  function aliveRoster(roster = gameRosterRef.current) {
    return roster.filter(p => p.alive)
  }

  function finishMatch(winner, roster = gameRoster, scores = voteScores) {
    if (!isHost) return
    const scoreEntries = Object.entries(scores)
    const maxScore = scoreEntries.length ? Math.max(...scoreEntries.map(([, score]) => score)) : 0
    const mvpId = scoreEntries.find(([, score]) => score === maxScore && score > 0)?.[0]
    const mvp = roster.find(p => p.id === mvpId)?.name || ''
    setGameWinner(winner)
    setGameMvp(mvp)
    setScreen('gameOver')
    retireRoomRegistry(roomCode, registryTokenRef.current).catch(() => {})
    broadcast({ type: 'game-over', winner, mvp, roster })
  }

  function applyLoverChain(roster, victim) {
    if (!victim || victim.roleId !== 'lover') return { roster, chained: [] }
    const otherLovers = roster.filter(p => p.roleId === 'lover' && p.alive && p.id !== victim.id)
    if (!otherLovers.length) return { roster, chained: [] }
    const chainedIds = new Set(otherLovers.map(p => p.id))
    return {
      roster: roster.map(p => chainedIds.has(p.id) ? { ...p, alive: false } : p),
      chained: otherLovers,
    }
  }

  function checkWin(roster, eliminatedRoleId = '', scores = voteScores) {
    if (eliminatedRoleId === 'madness') {
      finishMatch('madness', roster, scores)
      return true
    }
    const alive = aliveRoster(roster)
    const killers = alive.filter(p => p.roleId === 'visibleKiller' || p.roleId === 'hiddenKiller')
    const nonKillers = alive.filter(p => p.roleId !== 'visibleKiller' && p.roleId !== 'hiddenKiller')
    if (killers.length === 0) {
      finishMatch('citizens', roster, scores)
      return true
    }
    if (killers.length > 0 && nonKillers.length <= 1) {
      finishMatch('killers', roster, scores)
      return true
    }
    return false
  }

  function sendSpectatorMessage(rawText, senderId = peerRef.current?.id) {
    const text = String(rawText || '').trim().slice(0, 300)
    if (!text) return
    const rosterNow = gameRosterRef.current
    const spectatorsNow = spectatorsRef.current
    const sender = rosterNow.find(p => p.id === senderId) || spectatorsNow.find(p => p.id === senderId)
    const senderDead = rosterNow.some(p => p.id === senderId && !p.alive)
    const senderSpectator = spectatorsNow.some(p => p.id === senderId)
    if (senderId === peerRef.current?.id) {
      if (!isDead && joinMode !== 'spectator') return
    } else if (!senderDead && !senderSpectator) return
    const message = { id: crypto.randomUUID(), name: sender?.name || name || 'Spectator', text, at: Date.now() }
    setSpectatorMessages(current => [...current.slice(-49), message])
    guestConnsRef.current.forEach((conn, peerId) => {
      const deadPeer = rosterNow.some(p => p.id === peerId && !p.alive)
      const spectatorPeer = spectatorsNow.some(p => p.id === peerId)
      if (conn?.open && (deadPeer || spectatorPeer)) conn.send({ type: 'spectator-chat', message })
    })
    setSpectatorText('')
  }

  function resolveKamikazeAction(actorId, targetName) {
    if (!isHost || phaseRef.current !== 'day' || !targetName) return
    const rosterNow = gameRosterRef.current
    const actor = rosterNow.find(p => p.id === actorId)
    const target = rosterNow.find(p => p.name === targetName && p.alive)
    if (!actor?.alive || actor.roleId !== 'kamikaze' || !target) return
    if (kamikazeUsedRef.current.has(actorId)) return
    if (target.id === actorId) return
    if (target.roleId === 'visibleKiller' || target.roleId === 'hiddenKiller') return

    kamikazeUsedRef.current.add(actorId)
    if (actorId === peerRef.current?.id) setKamikazeUsed(true)
    else guestConnsRef.current.get(actorId)?.send({ type: 'kamikaze-used' })

    let nextRoster = rosterNow.map(p =>
      p.id === actor.id || p.id === target.id ? { ...p, alive: false } : p
    )

    const loverChain = applyLoverChain(nextRoster, target)
    nextRoster = loverChain.roster

    setGameRoster(nextRoster)
    gameRosterRef.current = nextRoster
    broadcast({ type: 'game-state', roster: publicRoster(nextRoster) })
    broadcast({ type: 'kamikaze-result', kamikaze: actor.name, target: target.name })
    speak(`${actor.name} ${t('kamikazeBoom')} ${target.name}.`)

    const eliminated = [actor, target, ...loverChain.chained]
    const unique = [...new Map(eliminated.map(p => [p.id, p])).values()]
    unique.forEach(player => {
      if (player.id === peerRef.current?.id) setIsDead(true)
      else guestConnsRef.current.get(player.id)?.send({ type: 'eliminated', reason: player.id === actor.id ? 'kamikaze' : 'explosion' })
    })

    checkWin(nextRoster, '')
  }

  function triggerKamikaze(targetName) {
    if (!targetName || isDead || kamikazeUsed || phase !== 'day' || myRole?.id !== 'kamikaze') return
    const myId = peerRef.current?.id
    if (!myId) return
    if (isHost) resolveKamikazeAction(myId, targetName)
    else hostConnRef.current?.send({ type: 'kamikaze-action', target: targetName })
  }

  function sendDayMessage(rawText, senderId = peerRef.current?.id) {
    const text = String(rawText || '').trim().slice(0, 300)
    if (!text || phaseRef.current !== 'day') return
    const sender = gameRosterRef.current.find(p => p.id === senderId)
    if (!sender?.alive) return
    const message = { id: crypto.randomUUID(), name: sender.name, text, at: Date.now() }
    setDayMessages(current => [...current.slice(-79), message])
    guestConnsRef.current.forEach((conn, peerId) => {
      const alivePeer = gameRosterRef.current.some(p => p.id === peerId && p.alive)
      if (conn?.open && alivePeer) conn.send({ type: 'day-chat', message })
    })
    setDayText('')
  }

  function registerDayVote(voterId, target) {
    if (!isHost || phaseRef.current !== 'vote' || !target) return
    const rosterNow = gameRosterRef.current
    const voter = rosterNow.find(p => p.id === voterId)
    if (!voter?.alive) return
    setPlayerVotes(current => {
      const next = { ...current, [voterId]: target }
      playerVotesRef.current = next
      return next
    })
  }

  function resolveDayVote(votesMap) {
    if (!isHost) return
    const rosterNow = gameRosterRef.current
    const counts = {}
    Object.values(votesMap).forEach(target => {
      if (target && target !== 'skip') counts[target] = (counts[target] || 0) + 1
    })
    const ranked = Object.entries(counts).sort((a,b) => b[1] - a[1])
    const topCount = ranked[0]?.[1] || 0
    const tied = ranked.filter(([, count]) => count === topCount).map(([target]) => target)
    const eliminatedName = tied.length === 1 ? tied[0] : ''

    const nextScores = { ...voteScores }
    Object.entries(votesMap).forEach(([voterId, target]) => {
      const targetPlayer = rosterNow.find(p => p.name === target)
      if (targetPlayer && (targetPlayer.roleId === 'visibleKiller' || targetPlayer.roleId === 'hiddenKiller')) {
        nextScores[voterId] = (nextScores[voterId] || 0) + 1
      }
    })
    setVoteScores(nextScores)

    if (eliminatedName) {
      const victim = rosterNow.find(p => p.name === eliminatedName && p.alive)
      if (victim) {
        const roleLabel = roleName({ id: victim.roleId })
        speak(`${victim.name} ${t('eliminated')} ${roleLabel}.`)
        broadcast({ type: 'vote-result', name: victim.name, roleLabel })
        let nextRoster = rosterNow.map(p => p.id === victim.id ? { ...p, alive: false } : p)
        const loverChain = applyLoverChain(nextRoster, victim)
        nextRoster = loverChain.roster
        setGameRoster(nextRoster)
        gameRosterRef.current = nextRoster
        broadcast({ type: 'game-state', roster: publicRoster(nextRoster) })
        if (victim.id === peerRef.current?.id) setIsDead(true)
        else guestConnsRef.current.get(victim.id)?.send({ type: 'eliminated', reason: 'vote' })
        loverChain.chained.forEach(partner => {
          if (partner.id === peerRef.current?.id) setIsDead(true)
          else guestConnsRef.current.get(partner.id)?.send({ type: 'eliminated', reason: 'lover' })
        })
        if (checkWin(nextRoster, victim.roleId, nextScores)) return
      }
    } else {
      speak(t('noElimination'))
      broadcast({ type: 'vote-result', name: '', roleLabel: '' })
    }

    const nextRound = round + 1
    setPlayerVotes({})
    playerVotesRef.current = {}
    setVote('')
    setPhase('night')
    setRound(nextRound)
    broadcast({ type: 'phase-change', phase: 'night', round: nextRound })
  }

  function resolveKillerVotes(currentKillerVotes = killerVotesRef.current, currentDoctorProtected = doctorProtectedRef.current) {
    if (!isHost || phase !== 'night') return
    const values = Object.values(currentKillerVotes).filter(Boolean)
    let target = ''
    if (values.length === 1) target = values[0]
    if (values.length >= 2) {
      target = values.every(v => v === values[0])
        ? values[0]
        : values[Math.floor(Math.random() * values.length)]
    }

    const saved = !!target && !!currentDoctorProtected && target === currentDoctorProtected
    const resolvedTarget = saved ? '' : target

    setNightSaved(saved)
    setNightResolvedTarget(resolvedTarget)
    broadcast({ type: 'night-result', target: resolvedTarget, saved })

    if (resolvedTarget) {
      const rosterNow = gameRosterRef.current
      const victim = rosterNow.find(p => p.name === resolvedTarget && p.alive)
      if (victim) {
        let nextRoster = rosterNow.map(p => p.id === victim.id ? { ...p, alive: false } : p)
        const loverChain = applyLoverChain(nextRoster, victim)
        nextRoster = loverChain.roster
        setGameRoster(nextRoster)
        gameRosterRef.current = nextRoster
        broadcast({ type: 'game-state', roster: publicRoster(nextRoster) })
        if (victim.id === peerRef.current?.id) setIsDead(true)
        else guestConnsRef.current.get(victim.id)?.send({ type: 'eliminated', reason: 'night' })
        loverChain.chained.forEach(partner => {
          if (partner.id === peerRef.current?.id) setIsDead(true)
          else guestConnsRef.current.get(partner.id)?.send({ type: 'eliminated', reason: 'lover' })
        })
        if (checkWin(nextRoster, '')) return
      }
    }

    setPhase('day')
    setDiscussion(120)
    broadcast({ type: 'phase-change', phase: 'day', round })
  }

  function nextPhase() {
    if (!isHost) return
    if (phase === 'night') {
      resolveKillerVotes()
    } else {
      setPhase('vote')
      broadcast({ type: 'phase-change', phase: 'vote', round })
    }
  }

  function sessionSettings() {
    return {
      roomName,
      accessMode,
      accessCode,
      maxPlayers,
      maxSpectators,
      roles,
      narratorOn,
      lang,
    }
  }

  function leaveToBrowser(notify = true) {
    const oldCode = roomCode
    if (notify && isHost) broadcast({ type: 'return-browser' })
    if (isHost) retireRoomRegistry(oldCode, registryTokenRef.current).catch(() => {})
    closeAllVoice()
    hostConnRef.current?.close?.()
    peerRef.current?.destroy?.()
    guestConnsRef.current.clear()
    setRoomCode('')
    setJoinCode('')
    registryTokenRef.current = ''
    setIsHost(false)
    setPlayers([])
    setSpectators([])
    setReady(false)
    setMyRole(null)
    setPhase('night')
    setRound(1)
    setVote('')
    setGameRoster([])
    gameRosterRef.current = []
    setPlayerVotes({})
    setVoteScores({})
    setIsDead(false)
    setSpectatorMessages([])
    setGameWinner('')
    setGameMvp('')
    setConnectionState('idle')
    setConnectionError('')
    setSessionTransitioning(false)
    setScreen('home')
  }

  function connectFreshSession(payload, oldPeerId) {
    const Peer = getPeer()
    if (!Peer) return
    const becomingHost = oldPeerId === payload.newHostId
    const newCode = payload.newCode
    const settings = payload.settings || {}
    sessionRejoinTokenRef.current = payload.rejoinToken || ''
    registryTokenRef.current = becomingHost ? (payload.registryToken || '') : ''

    setRoomCode(newCode)
    setRoomName(settings.roomName ?? roomName)
    setAccessMode(settings.accessMode ?? accessMode)
    setAccessCode(settings.accessCode ?? accessCode)
    setMaxPlayers(settings.maxPlayers ?? maxPlayers)
    setMaxSpectators(settings.maxSpectators ?? maxSpectators)
    setRoles(settings.roles ?? roles)
    setNarratorOn(settings.narratorOn ?? narratorOn)
    setLang(settings.lang ?? lang)
    setPlayers([])
    setSpectators([])
    setReady(false)
    setMyRole(null)
    setPhase('night')
    setRound(1)
    setVote('')
    setConnectionError('')
    setConnectionState('connecting')

    if (becomingHost) {
      setIsHost(true)
      const peer = new Peer(roomPeerId(newCode))
      peerRef.current = peer
      peer.on('call', handleIncomingVoiceCall)
      peer.on('open', id => {
        const hostPlayer = { id, name: name.trim().slice(0,18), ready: false, isHost: true }
        writeRoomRegistry({
          room_code: newCode,
          room_name: (settings.roomName || `${name.trim()}'s Room`).slice(0,40),
          host_name: name.trim().slice(0,18),
          language: settings.lang || lang,
          access_mode: settings.accessMode || 'open',
          player_count: 1,
          max_players: settings.maxPlayers ?? maxPlayers,
          spectator_count: 0,
          max_spectators: settings.maxSpectators ?? maxSpectators,
          narrator_enabled: settings.narratorOn !== false,
          started: false,
        }, registryTokenRef.current, false).catch(() => {})
        setPlayers([hostPlayer])
        setConnectionState('connected')
        setSessionTransitioning(false)
        setScreen('lobby')
      })
      peer.on('connection', setupHostConnection)
      peer.on('error', () => {
        setConnectionState('error')
        setConnectionError(t('roomOpenFail'))
      })
    } else {
      setIsHost(false)
      const peer = new Peer()
      peerRef.current = peer
      peer.on('call', handleIncomingVoiceCall)
      peer.on('open', () => {
        const conn = peer.connect(roomPeerId(newCode), { reliable: true })
        hostConnRef.current = conn
        conn.on('open', () => {
          conn.send({
            type: 'session-rejoin',
            token: payload.rejoinToken,
            name: name.trim(),
            mode: joinMode,
          })
        })
        conn.on('data', data => {
          if (!data || typeof data !== 'object') return
          if (data.type === 'join-approved') {
            setConnectionState('connected')
            setSessionTransitioning(false)
            setScreen('lobby')
          }
          if (data.type === 'room-state') {
            setPlayers(data.players || [])
            setSpectators(data.spectators || [])
            setMaxPlayers(data.maxPlayers ?? settings.maxPlayers ?? 10)
            setMaxSpectators(data.maxSpectators ?? settings.maxSpectators ?? 4)
            setRoles(data.roles || settings.roles || DEFAULT_ROLES)
          }
        })
      })
    }
  }

  function transitionToFreshSession(payload) {
    const oldPeerId = peerRef.current?.id
    setSessionTransitioning(true)
    closeAllVoice()
    hostConnRef.current?.close?.()
    peerRef.current?.destroy?.()
    guestConnsRef.current.clear()
    setTimeout(() => connectFreshSession(payload, oldPeerId), 450)
  }

  function startFreshSession(randomHost = false) {
    if (!isHost || sessionTransitioning) return
    const oldCode = roomCode
    const oldHostId = peerRef.current?.id
    const candidates = players.map(p => p.id).filter(Boolean)
    const newHostId = randomHost && candidates.length
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : oldHostId
    const newRegistryToken = `${crypto.randomUUID()}${crypto.randomUUID()}`
    const payload = {
      type: 'session-transition',
      newCode: randomCode(),
      newHostId,
      rejoinToken: crypto.randomUUID(),
      settings: sessionSettings(),
    }

    setSessionTransitioning(true)
    retireRoomRegistry(oldCode, registryTokenRef.current).catch(() => {})

    guestConnsRef.current.forEach((conn, peerId) => {
      if (!conn?.open) return
      const safeSettings = { ...payload.settings }
      if (peerId !== newHostId) safeSettings.accessCode = ''
      conn.send({
        ...payload,
        settings: safeSettings,
        registryToken: peerId === newHostId ? newRegistryToken : '',
      })
    })

    transitionToFreshSession({
      ...payload,
      registryToken: newHostId === oldHostId ? newRegistryToken : '',
    })
  }

  function finishVote() {
    if (!vote || isDead) return
    const voterId = peerRef.current?.id
    if (!voterId) return
    if (isHost) registerDayVote(voterId, vote)
    else hostConnRef.current?.send({ type: 'player-vote', target: vote })
  }

  const timerText = `${String(Math.floor(discussion / 60)).padStart(2, '0')}:${String(discussion % 60).padStart(2, '0')}`
  const configuredRoleSlots = roles.reduce((sum, role) => sum + role.count, 0)
  const roleConfigValid = configuredRoleSlots <= players.length
  const allReady = players.length >= 2 && players.every(p => p.ready) && roleConfigValid

  return (
    <main className="palermoShell">
      <div className="palermoNoise" />
      <header className="palermoTop">
        <div className="palermoBrand">PALERMO <span>// ONLINE</span></div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {screen !== 'language' && <button onClick={() => setScreen('language')} style={{padding:'8px 10px'}}>{lang === 'el' ? 'ΕΛ' : 'EN'}</button>}
          <div className="palermoBadge">{connectionState === 'connected' ? t('realtimeLobby') : t('browserGame')}</div>
        </div>
      </header>

      {screen === 'language' && (
        <section className="palermoPanelWrap">
          <div className="card joinCard">
            <div className="palermoEyebrow">PALERMO ONLINE</div>
            <h2>{TEXT.en.chooseLanguage}</h2>
            <div className="modeSwitch">
              <button className="primary" onClick={() => chooseLanguage('en')}>ENGLISH</button>
              <button className="primary" onClick={() => chooseLanguage('el')}>ΕΛΛΗΝΙΚΑ</button>
            </div>
          </div>
        </section>
      )}

      {screen === 'home' && (
        <section className="palermoHero">
          <div className="palermoEyebrow">{t('social')}</div>
          <h1>PALERMO<br/><span>ONLINE.</span></h1>
          <p>{t('intro')}</p>

          <div className="palermoEntry card">
            <label>{t('displayName')}</label>
            <input value={name} onChange={e => setName(e.target.value)} maxLength={18} placeholder="e.g. Soul" />
            <label style={{marginTop:12}}>{t('roomName')}</label>
            <input value={roomName} onChange={e => setRoomName(e.target.value)} maxLength={40} placeholder={name.trim() ? `${name.trim()}'s Room` : 'Palermo Room'} />
            <label style={{marginTop:12}}>{t('access')}</label>
            <div className="modeSwitch">
              <button className={accessMode === 'open' ? 'active' : ''} onClick={() => setAccessMode('open')}>{t('openRoom')}</button>
              <button className={accessMode === 'request' ? 'active' : ''} onClick={() => setAccessMode('request')}>{t('approvalRoom')}</button>
              <button className={accessMode === 'code' ? 'active' : ''} onClick={() => setAccessMode('code')}>{t('passwordRoom')}</button>
            </div>
            {accessMode === 'code' && <input value={accessCode} onChange={e => setAccessCode(e.target.value)} maxLength={20} placeholder={t('roomPassword')} />}
            <div className="palermoActions">
              <button className="primary" onClick={createRoom} disabled={!name.trim() || connectionState === 'connecting'}>{t('createRoom')}</button>
              <button onClick={() => setScreen('join')} disabled={!name.trim()}>{t('joinRoom')}</button>
            </div>
            {connectionError && <small className="errorText">{connectionError}</small>}
          </div>

          <div className="featureStrip">
            <span>{t('noAccount')}</span><span>{t('realPlayers')}</span><span>{t('roomCodes')}</span><span>{t('readySystem')}</span><span>{t('roleReveal')}</span>
          </div>
          <button className="menuMusicToggle" onClick={toggleMenuMusic}>♫ {t('music')}: {menuMusicOn ? t('musicOn') : t('musicOff')}</button>
        </section>
      )}

      {screen === 'join' && (
        <section className="palermoPanelWrap">
          <button className="backBtn" onClick={() => setScreen('home')}>← {t('back')}</button>
          <div className="card joinCard">
            <div className="palermoEyebrow">{t('joinPrivate')}</div>
            <h2>{t('enterCode')}</h2>
            <div className="cardTitle" style={{marginBottom:10}}><span>{t('publicRooms')}</span><button onClick={async () => { setRoomsLoading(true); try { setPublicRooms(await fetchPublicRooms()) } finally { setRoomsLoading(false) } }}>{t('refreshRooms')}</button></div>
            <div style={{display:'grid',gap:8,maxHeight:260,overflowY:'auto',marginBottom:16}}>
              {publicRooms.map(room => (
                <button key={room.room_code} onClick={() => { setJoinCode(room.room_code); setJoinAccessCode('') }} style={{textAlign:'left',padding:12}}>
                  <strong>{room.room_name}</strong>
                  <small style={{display:'block',opacity:.75,marginTop:4}}>
                    {room.host_name} · {room.player_count}/{room.max_players} · {room.language === 'el' ? 'ΕΛ' : 'EN'} · {room.access_mode === 'open' ? 'OPEN' : room.access_mode === 'request' ? 'HOST APPROVAL' : 'PASSWORD'}
                  </small>
                </button>
              ))}
              {!roomsLoading && publicRooms.length === 0 && <small>{t('noPublicRooms')}</small>}
              {roomsLoading && <small>{t('connecting')}</small>}
            </div>
            <input className="codeInput" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} maxLength={8} placeholder="X7K9Q" />
            <input value={joinAccessCode} onChange={e => setJoinAccessCode(e.target.value)} maxLength={20} placeholder={t('roomPassword')} style={{marginTop:10}} />
            <div className="modeSwitch">
              <button className={joinMode === 'player' ? 'active' : ''} onClick={() => setJoinMode('player')}>{t('player')}</button>
              <button className={joinMode === 'spectator' ? 'active' : ''} onClick={() => setJoinMode('spectator')}>{t('spectator')}</button>
            </div>
            <button className="primary wide" disabled={!joinCode.trim() || connectionState === 'connecting'} onClick={joinRoom}>
              {connectionState === 'connecting' ? t('connecting') : `${t('joinRoom')} — ${joinMode === 'player' ? t('player') : t('spectator')}`}
            </button>
            {joinPending && <small style={{display:'block',marginTop:10}}>{t('requestPending')}</small>}
            {connectionError && <small className="errorText">{connectionError}</small>}
          </div>
        </section>
      )}

      {screen === 'lobby' && (
        <section className="lobbyWrap">
          <div className="lobbyHead">
            <div>
              <div className="palermoEyebrow">{t('privateRoom')} // {connectionState === 'connected' ? t('connected') : t('connecting')}</div>
              <h2>{t('room')} <span>{roomCode}</span></h2>
            </div>
            <button className="copyCode" onClick={() => navigator.clipboard?.writeText(roomCode)}>{t('copyCode')}</button>
          </div>

          <div className="lobbyGrid">
            <div className="card playersCard">
              <div className="cardTitle"><span>{t('players')}</span><b>{players.length}/{maxPlayers}</b></div>
              <div className="playerList">
                {players.map((player, i) => (
                  <div className="playerRow" key={player.id || i}>
                    <span className="avatar">{player.name.slice(0,1).toUpperCase()}</span>
                    <strong>{player.name}{player.isHost ? ' 👑' : ''}</strong>
                    <i className={player.ready ? 'readyDot on' : 'readyDot'} />
                    <small>{player.ready ? t('ready') : t('notReady')}</small>
                  </div>
                ))}
                {players.length === 0 && <p>{t('noPlayers')}</p>}
              </div>
              {joinMode !== 'spectator' && (
                <button className={ready ? 'readyButton active' : 'readyButton'} onClick={toggleReady}>
                  {ready ? `✓ ${t('ready')}` : t('markReady')}
                </button>
              )}
            </div>

            <div className="card settingsCard">
              <div className="cardTitle"><span>{isHost ? t('hostSettings') : t('roomSettings')}</span><b>{isHost ? t('host') : t('synced')}</b></div>

              <div className="settingsRow">
                <label>{t('maxPlayers')} <b>{maxPlayers}</b></label>
                <input disabled={!isHost} type="range" min="4" max="16" value={maxPlayers} onChange={e => changeMaxPlayers(e.target.value)} />
              </div>

              <div className="settingsRow">
                <label>{t('maxSpectators')} <b>{maxSpectators}</b></label>
                <input disabled={!isHost} type="range" min="0" max="10" value={maxSpectators} onChange={e => changeMaxSpectators(e.target.value)} />
              </div>

              {isHost && pendingRequests.length > 0 && (
                <div style={{margin:'16px 0'}}>
                  <div className="cardTitle"><span>{t('joinRequests')}</span><b>{pendingRequests.length}</b></div>
                  {pendingRequests.map(req => (
                    <div className="joinRequestRow" key={req.peerId}>
                      <div className="joinRequestPlayer">
                        <span className="avatar">{req.name.slice(0,1).toUpperCase()}</span>
                        <div className="joinRequestMeta">
                          <strong>{req.name}</strong>
                          <small>{req.mode === 'spectator' ? t('spectator') : t('player')}</small>
                        </div>
                      </div>
                      <div className="joinRequestActions">
                        <button className="joinApprove" onClick={() => decideJoin(req.peerId, true)}>{t('approve')}</button>
                        <button className="joinDeny" onClick={() => decideJoin(req.peerId, false)}>{t('deny')}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="roleConfig">
                {roles.map(role => (
                  <div className="roleConfigRow" key={role.id}>
                    <span>{role.emoji} {roleName(role)}</span>
                    <div>
                      <button disabled={!isHost || role.count <= role.min} onClick={() => changeRole(role.id, -1)}>−</button>
                      <b>{role.count}</b>
                      <button disabled={!isHost || role.count >= 4} onClick={() => changeRole(role.id, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              {!roleConfigValid && <div className="prototypeNotice">{lang === 'el' ? 'Έχεις επιλέξει περισσότερους ειδικούς ρόλους από τους διαθέσιμους παίκτες.' : 'You selected more special-role slots than available players.'}</div>}
              <div className="roleTotal">{t('spectators')} <b>{spectators.length}/{maxSpectators}</b></div>
              {spectators.map(s => <div className="playerRow" key={s.id}><span className="avatar">{s.name[0]}</span><strong>{s.name}</strong><small>{t('spectator')}</small></div>)}
            </div>
          </div>

          <div className="card micCard">
            <div>
              <div className="cardTitle"><span>{t('voiceChat')}</span><b>{micState === 'granted' ? t('micReady') : t('optional')}</b></div>
              <p>{t('voiceExplain')}</p>
              {micError && <small className="errorText">{micError}</small>}
            </div>
            <div className="micActions">
              {micState !== 'granted'
                ? <button onClick={requestMic}>{t('enableMicrophone')}</button>
                : <button className={muted ? 'danger' : 'primary'} onClick={toggleMute}>{muted ? t('unmute') : t('muteMic')}</button>}
            </div>
          </div>

          <div className="card micCard">
            <div>
              <div className="cardTitle"><span>{t('narrator')}</span><b>{narratorOn ? t('narratorOn') : t('narratorOff')}</b></div>
              <p>{t('narratorHint')}</p>
            </div>
            <div className="micActions">
              <button className={narratorOn ? 'primary' : ''} onClick={() => { window.speechSynthesis?.cancel?.(); setNarratorOn(v => !v) }}>
                {narratorOn ? t('narratorOn') : t('narratorOff')}
              </button>
            </div>
          </div>

          <div className="lobbyFooter">
            <span>{players.length} {players.length === 1 ? t('realPlayer') : t('realPlayersCount')} {t('connected')}</span>
            {isHost
              ? <button className="primary startBtn" disabled={!allReady || countdown !== null} onClick={startGame}>
                  {countdown !== null ? `${t('startingIn')} ${countdown}` : allReady ? t('startGame') : t('waitingReady')}
                </button>
              : <button className="primary startBtn" disabled>{countdown !== null ? `${t('startingIn')} ${countdown}` : t('waitingHost')}</button>}
          </div>

          {connectionError && <div className="prototypeNotice">{connectionError}</div>}
        </section>
      )}

      {screen === 'role' && myRole && (
        <section className="roleRevealWrap">
          <div className="roleReveal card">
            <div className="palermoEyebrow">{t('privateScreen')}</div>
            <div className="roleEmoji">{myRole.emoji}</div>
            <small>{t('yourRole')}</small>
            <h2>{roleName(myRole).toUpperCase()}</h2>
            {myRole.id === 'lover' && myRole.loverPartner && <div className="prototypeNotice">❤️ {myRole.loverPartner}</div>}
            <p>{myRole.id === 'visibleKiller'
              ? t('roleVisibleKiller')
              : myRole.id === 'hiddenKiller'
              ? t('roleHiddenKiller')
              : myRole.id === 'detective'
              ? t('roleDetective')
              : myRole.id === 'doctor'
              ? t('roleDoctor')
              : myRole.id === 'lover'
              ? t('roleLover')
              : myRole.id === 'kamikaze'
              ? t('roleKamikaze')
              : myRole.id === 'madness'
              ? t('roleMadness')
              : t('roleCitizen')}</p>
            <button className="primary wide" onClick={() => setScreen('game')}>{t('understand')}</button>
          </div>
        </section>
      )}

      {screen === 'game' && (
        <section className="gameWrap">
          <div className="gameTop">
            <div><small>{t('room')} {roomCode}</small><h2>{t('round')} {round}</h2></div>
            <div className={`phasePill ${phase}`}>{phase === 'night' ? `🌙 ${t('night')}` : phase === 'day' ? `☀️ ${t('day')}` : `🗳️ ${t('voting')}`}</div>
          </div>

          <div className="gameGrid">
            <div className="card phaseCard">
              {phase === 'night' && <>
                <div className="bigIcon">🌙</div>
                <h3>{t('citySleeping')}</h3>
                {!isDead && (myRole?.id === 'visibleKiller' || myRole?.id === 'hiddenKiller') ? (
                  <>
                    <p>{lang === 'el'
                      ? 'Έχεις 15 δευτερόλεπτα να επιλέξεις στόχο. Δεν βλέπεις την επιλογή του άλλου δολοφόνου.'
                      : 'You have 15 seconds to choose a target. You cannot see the other killer’s choice.'}</p>
                    <div className="discussionTimer">00:{String(nightTimer).padStart(2,'0')}</div>
                    <div className="targetGrid">
                      {gameRoster.filter(p => p.alive && p.name !== name).map(p => (
                        <button
                          key={p.id}
                          className={killerVote === p.name ? 'selected' : ''}
                          onClick={() => submitKillerVote(p.name)}
                          disabled={nightTimer <= 0}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                    <small>{killerVote
                      ? (lang === 'el' ? `Επέλεξες: ${killerVote}` : `Selected: ${killerVote}`)
                      : (lang === 'el' ? 'Δεν έχεις επιλέξει ακόμα.' : 'No target selected yet.')}</small>
                  </>
                ) : !isDead && myRole?.id === 'doctor' ? (
                  <>
                    <p>{lang === 'el'
                      ? 'Έχεις 15 δευτερόλεπτα να προστατέψεις έναν παίκτη. Μπορείς να επιλέξεις και τον εαυτό σου.'
                      : 'You have 15 seconds to protect one player. You may choose yourself.'}</p>
                    <div className="discussionTimer">00:{String(nightTimer).padStart(2,'0')}</div>
                    <div className="targetGrid">
                      {gameRoster.filter(p => p.alive).map(p => (
                        <button
                          key={p.id}
                          className={doctorVote === p.name ? 'selected' : ''}
                          onClick={() => submitDoctorVote(p.name)}
                          disabled={nightTimer <= 0}
                        >
                          {p.name}{p.name === name ? (lang === 'el' ? ' (Εσύ)' : ' (You)') : ''}
                        </button>
                      ))}
                    </div>
                    <small>{doctorVote
                      ? (lang === 'el' ? `Προστατεύεις: ${doctorVote}` : `Protecting: ${doctorVote}`)
                      : (lang === 'el' ? 'Δεν έχεις επιλέξει ακόμα.' : 'No player selected yet.')}</small>
                  </>
                ) : !isDead && myRole?.id === 'detective' && round === 1 && myRole?.knownVisibleKiller ? (
                  <>
                    <p>{lang === 'el'
                      ? 'Πρώτη νύχτα: αυτή η πληροφορία είναι ιδιωτική. Μην αποκαλύψεις τον ρόλο σου.'
                      : 'First night: this information is private. Do not reveal your role.'}</p>
                    <div className="detectiveIntel">
                      <small>{t('knownKiller')}</small>
                      <strong>{myRole.knownVisibleKiller}</strong>
                    </div>
                    <div className="discussionTimer">00:{String(nightTimer).padStart(2,'0')}</div>
                  </>
                ) : (
                  <>
                    <p>{lang === 'el'
                      ? 'Η νύχτα είναι σε εξέλιξη. Περίμενε μέχρι να ολοκληρωθούν οι κρυφές ενέργειες.'
                      : 'Night actions are in progress. Wait while the hidden roles act.'}</p>
                    <div className="discussionTimer">00:{String(nightTimer).padStart(2,'0')}</div>
                    <div className="prototypeNotice">{lang === 'el' ? 'ΝΥΧΤΑ // ΚΛΕΙΔΩΜΕΝΟ' : 'NIGHT // LOCKED'}</div>
                  </>
                )}

              </>}

              {phase === 'day' && <>
                <div className="bigIcon">☀️</div>
                <h3>{t('discussion')}</h3>
                <div className="discussionTimer">{timerText}</div>
                <p>{t('dayChatHint')}</p>
                {!isDead && myRole?.id === 'kamikaze' && (
                  <div className="kamikazePanel">
                    <div className="cardTitle"><span>💣 {t('kamikazeAction')}</span><b>{kamikazeUsed ? t('kamikazeUsed') : '1×'}</b></div>
                    <p>{t('kamikazeChoose')}</p>
                    <div className="targetGrid">
                      {gameRoster.filter(p =>
                        p.alive &&
                        p.name !== name &&
                        p.roleId !== 'visibleKiller' &&
                        p.roleId !== 'hiddenKiller'
                      ).map(p => (
                        <button
                          key={p.id}
                          disabled={kamikazeUsed}
                          onClick={() => triggerKamikaze(p.name)}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {!isDead && (
                  <div className="dayChatBox">
                    <div className="dayMessages">
                      {dayMessages.map(msg => <div key={msg.id}><strong>{msg.name}</strong><span>{msg.text}</span></div>)}
                    </div>
                    <form onSubmit={e => { e.preventDefault(); if (isHost) sendDayMessage(dayText); else { hostConnRef.current?.send({ type:'day-chat', text:dayText }); setDayText('') } }}>
                      <input value={dayText} onChange={e => setDayText(e.target.value)} maxLength={300} placeholder={t('dayChat')} />
                      <button type="submit" disabled={!dayText.trim()}>{t('send')}</button>
                    </form>
                  </div>
                )}
              </>}

              {phase === 'vote' && <>
                <div className="bigIcon">🗳️</div>
                <h3>{t('voteTime')}</h3>
                <div className="discussionTimer">00:{String(voteTimer).padStart(2,'0')}</div>
                <h3>{t('castVote')}</h3>
                <div className="voteList">
                  {gameRoster.filter(p => p.alive && p.name !== name).map(p => (
                    <button className={vote === p.name ? 'selected' : ''} onClick={() => setVote(p.name)} key={p.id}>{p.name}</button>
                  ))}
                  <button className={vote === 'skip' ? 'selected' : ''} onClick={() => setVote('skip')}>{t('skipVote')}</button>
                </div>
                <button className="primary wide" disabled={!vote || isDead} onClick={finishVote}>{t('lockVote')}</button>
              </>}
            </div>

            <div className="sideStack">
              <div className="card miniRole">
                <small>{t('yourRole')}</small>
                <strong>{myRole?.emoji} {roleName(myRole)}</strong>
                <span>{isDead ? ('☠ ' + t('dead') + ' // ' + t('spectatorOnly')) : t('alive')}</span>
              </div>
              <div className="card voiceBox">
                <div className="cardTitle"><span>{t('narrator')}</span><b>{narratorOn ? t('narratorOn') : t('narratorOff')}</b></div>
                <button onClick={() => { window.speechSynthesis?.cancel?.(); setNarratorOn(v => !v) }}>{narratorOn ? t('narratorOn') : t('narratorOff')}</button>
                <p>{t('narratorHint')}</p>
              </div>
              {(isDead || joinMode === 'spectator') && (
                <div className="card spectatorChat">
                  <div className="cardTitle"><span>{t('spectatorChat')}</span><b>{t('spectatorOnly')}</b></div>
                  <p>{t('spectatorChatHint')}</p>
                  <div className="spectatorMessages">
                    {spectatorMessages.map(msg => (
                      <div key={msg.id}><strong>{msg.name}</strong><span>{msg.text}</span></div>
                    ))}
                  </div>
                  <form onSubmit={e => { e.preventDefault(); if (isHost) sendSpectatorMessage(spectatorText); else { hostConnRef.current?.send({ type:'spectator-chat', text:spectatorText }); setSpectatorText('') } }}>
                    <input value={spectatorText} onChange={e => setSpectatorText(e.target.value)} maxLength={300} placeholder={t('spectatorChat')} />
                    <button type="submit" disabled={!spectatorText.trim()}>{t('send')}</button>
                  </form>
                </div>
              )}
              <div className="card voiceBox">
                <div className="cardTitle"><span>{t('voice')}</span><b>{micState === 'granted' ? (muted ? t('muted') : t('micReady')) : t('off')}</b></div>
                {micState !== 'granted' ? <button onClick={requestMic}>{t('enableMic')}</button> : <button onClick={toggleMute}>{muted ? t('unmute') : t('mute')}</button>}
                <p>{t('voiceNext')}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {screen === 'gameOver' && (
        <section className="roleRevealWrap">
          <div className="roleReveal card endGameCard">
            <div className="palermoEyebrow">PALERMO // SESSION COMPLETE</div>
            <div className="roleEmoji">🏁</div>
            <h2>{gameWinner === 'madness' ? t('madnessWins') : gameWinner === 'killers' ? t('killersWin') : gameWinner === 'citizens' ? t('citizensWin') : t('gameOver')}</h2>
            {gameMvp && <div className="mvpBanner"><small>{t('mvp')}</small><strong>★ {gameMvp}</strong></div>}
            <div className="roleRevealList">
              <div className="cardTitle"><span>{t('allRoles')}</span><b>{gameRoster.length}</b></div>
              {gameRoster.map(p => (
                <div className="roleRevealLine" key={p.id}>
                  <span>{p.alive ? '●' : '☠'} {p.name}</span>
                  <strong>{roleName({ id: p.roleId })}</strong>
                </div>
              ))}
            </div>
            <p>{t('whatNext')}</p>

            {isHost ? (
              <div className="endGameChoices">
                <button className="endChoice primary" disabled={sessionTransitioning} onClick={() => startFreshSession(false)}>
                  <strong>{t('playAgain')}</strong>
                  <small>{t('playAgainHint')}</small>
                </button>
                <button className="endChoice" disabled={sessionTransitioning} onClick={() => startFreshSession(true)}>
                  <strong>{t('newSession')}</strong>
                  <small>{t('newSessionHint')}</small>
                </button>
                <button className="endChoice danger" disabled={sessionTransitioning} onClick={() => leaveToBrowser(true)}>
                  <strong>{t('leaveGame')}</strong>
                  <small>{t('leaveGameHint')}</small>
                </button>
              </div>
            ) : (
              <div style={{display:'grid',gap:12}}>
                <div className="prototypeNotice">{sessionTransitioning ? t('preparingSession') : t('waitingHost')}</div>
                <button className="endChoice danger" onClick={() => leaveToBrowser(false)}>
                  <strong>{t('leaveGame')}</strong>
                  <small>{t('leaveGameHint')}</small>
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      <button className="bugReportFab" onClick={() => { setBugOpen(true); setBugStatus('idle') }}>
        🐞 {t('reportBug')}
      </button>

      {bugOpen && (
        <div className="bugModalBackdrop" onClick={() => setBugOpen(false)}>
          <div className="bugModal card" onClick={e => e.stopPropagation()}>
            <div className="bugModalHead">
              <div>
                <div className="palermoEyebrow">PALERMO // FEEDBACK</div>
                <h3>{t('reportBugTitle')}</h3>
              </div>
              <button className="bugClose" onClick={() => setBugOpen(false)}>×</button>
            </div>

            <label>{t('bugCategory')}</label>
            <div className="bugCategoryGrid">
              {[
                ['gameplay', t('bugGameplay')],
                ['multiplayer', t('bugMultiplayer')],
                ['ui', t('bugUi')],
                ['audio', t('bugAudio')],
                ['other', t('bugOther')],
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={bugCategory === value ? 'active' : ''}
                  onClick={() => setBugCategory(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            <label>{t('bugDescription')}</label>
            <textarea
              className="bugTextarea"
              value={bugDescription}
              onChange={e => { setBugDescription(e.target.value); if (bugStatus === 'error') setBugStatus('idle') }}
              maxLength={1000}
              rows={6}
              placeholder={t('bugPlaceholder')}
            />
            <div className="bugCount">{bugDescription.length}/1000</div>

            {bugStatus === 'sent' && <div className="bugSuccess">{t('bugThanks')}</div>}
            {bugStatus === 'error' && <div className="errorText">{t('bugFailed')}</div>}

            <div className="bugActions">
              <button onClick={() => setBugOpen(false)}>{t('bugCancel')}</button>
              <button
                className="primary"
                disabled={bugDescription.trim().length < 3 || bugStatus === 'sending' || bugStatus === 'sent'}
                onClick={submitBugReport}
              >
                {bugStatus === 'sending' ? t('bugSending') : t('bugSubmit')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="palermoCredit">{t('madeBy')} <b>NEXORA</b></div>
    </main>
  )
}
