'use client'

import { useEffect, useRef, useState } from 'react'

const DEFAULT_ROLES = [
  { id: 'visibleKiller', label: 'Revealed Killer', emoji: '🔪', count: 1, min: 1 },
  { id: 'hiddenKiller', label: 'Hidden Killer', emoji: '🗡️', count: 0, min: 0 },
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

const PEER_OPTIONS = {
  debug: 1,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
    sdpSemantics: 'unified-plan',
  },
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
    noAccount: 'ACCOUNTS + GUESTS',
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
    inviteFriends: 'INVITE FRIENDS',
    inviteCopied: 'INVITE COPIED',
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
    voiceChat: 'COMMUNICATION',
    micReady: 'MIC READY',
    optional: 'OPTIONAL',
    voiceExplain: 'Use the in-game text chat, or talk with your group through Discord or another external voice app.',
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
    dayExplain: 'Living players may discuss using the in-game text chat or an external voice app such as Discord.',
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
    voiceNext: 'Palermo does not use built-in voice chat. Use the game text chat or Discord/external voice if your group wants to talk.',
    visibleKiller: 'Revealed Killer',
    hiddenKiller: 'Hidden Killer',
    detective: 'Detective',
    doctor: 'Doctor',
    lover: 'Lover',
    kamikaze: 'Kamikaze',
    madness: 'Madness',
    citizen: 'Citizen',
    roleVisibleKiller: 'You are the revealed killer. Each night, choose a target privately. You know who the other killer is, but you still choose your target independently.',
    roleHiddenKiller: 'You are the hidden killer. Each night, choose a target privately. You know who the other killer is, but you still choose your target independently.',
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
    duplicateName: 'That name is already being used in this room.',
    invalidRoomCode: 'Enter a valid 5-character room code.',
    lostHost: 'Connection to host was lost.',
    connectFail: 'Could not connect to that room code.',
    micDenied: 'Microphone permission was denied or unavailable.',
    narrator: 'NARRATOR', narratorOn: 'ON', narratorOff: 'OFF', narratorHint: 'Game events are spoken in your selected language.',
    narrRole: 'Your role is', knownKiller: 'THE REVEALED KILLER IS', narrNight: 'Night falls over Palermo. Close your eyes and keep your role hidden. Night actions begin now.', narrDay: 'Morning has come to Palermo. Open your eyes. You now have two minutes to discuss what happened and decide who you trust.', narrVote: 'Discussion is over. It is time to vote. Choose carefully. Once your vote is locked, it cannot be changed.',
    reportBug: 'REPORT A BUG',
    reportBugTitle: 'REPORT A BUG',
    bugCategory: 'PROBLEM TYPE',
    bugDescription: 'WHAT HAPPENED?',
    bugGameplay: 'Gameplay',
    bugMultiplayer: 'Multiplayer',
    bugUi: 'Interface',
    bugAudio: 'Narrator / Audio',
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
    noAccount: 'ΛΟΓΑΡΙΑΣΜΟΙ + ΕΠΙΣΚΕΠΤΕΣ',
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
    inviteFriends: 'ΠΡΟΣΚΛΗΣΗ ΦΙΛΩΝ',
    inviteCopied: 'Η ΠΡΟΣΚΛΗΣΗ ΑΝΤΙΓΡΑΦΗΚΕ',
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
    voiceChat: 'ΕΠΙΚΟΙΝΩΝΙΑ',
    micReady: 'ΜΙΚΡΟΦΩΝΟ ΕΤΟΙΜΟ',
    optional: 'ΠΡΟΑΙΡΕΤΙΚΟ',
    voiceExplain: 'Χρησιμοποίησε το text chat του παιχνιδιού ή μίλα με την παρέα σου μέσω Discord ή άλλης εξωτερικής εφαρμογής φωνής.',
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
    dayExplain: 'Οι ζωντανοί παίκτες μπορούν να συζητούν μέσω του text chat ή εξωτερικής εφαρμογής φωνής όπως το Discord.',
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
    voiceNext: 'Το Palermo δεν έχει ενσωματωμένο voice chat. Χρησιμοποίησε το text chat ή Discord/εξωτερική φωνή αν θέλει η παρέα να μιλάει.',
    visibleKiller: 'Φανερός Δολοφόνος',
    hiddenKiller: 'Κρυφός Δολοφόνος',
    detective: 'Ντετέκτιβ',
    doctor: 'Γιατρός',
    lover: 'Ερωτευμένη',
    kamikaze: 'Καμικάζε',
    madness: 'Τρέλα',
    citizen: 'Πολίτης',
    roleVisibleKiller: 'Είσαι ο Φανερός Δολοφόνος. Κάθε νύχτα επιλέγεις ιδιωτικά έναν στόχο. Γνωρίζεις ποιος είναι ο άλλος δολοφόνος, αλλά επιλέγεις τον στόχο σου ανεξάρτητα.',
    roleHiddenKiller: 'Είσαι ο Κρυφός Δολοφόνος. Κάθε νύχτα επιλέγεις ιδιωτικά έναν στόχο. Γνωρίζεις ποιος είναι ο άλλος δολοφόνος, αλλά επιλέγεις τον στόχο σου ανεξάρτητα.',
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
    duplicateName: 'Αυτό το όνομα χρησιμοποιείται ήδη σε αυτό το δωμάτιο.',
    invalidRoomCode: 'Βάλε έναν έγκυρο κωδικό δωματίου 5 χαρακτήρων.',
    lostHost: 'Η σύνδεση με τον host χάθηκε.',
    connectFail: 'Δεν ήταν δυνατή η σύνδεση σε αυτόν τον κωδικό.',
    micDenied: 'Η άδεια μικροφώνου απορρίφθηκε ή δεν είναι διαθέσιμη.',
    narrator: 'ΑΦΗΓΗΤΗΣ', narratorOn: 'ΕΝΕΡΓΟΣ', narratorOff: 'ΚΛΕΙΣΤΟΣ', narratorHint: 'Τα γεγονότα του παιχνιδιού ακούγονται στη γλώσσα που επέλεξες.',
    narrRole: 'Ο ρόλος σου είναι', knownKiller: 'Ο ΦΑΝΕΡΟΣ ΔΟΛΟΦΟΝΟΣ ΕΙΝΑΙ', narrNight: 'Η νύχτα πέφτει στο Παλέρμο. Κλείστε τα μάτια σας και κρατήστε τον ρόλο σας κρυφό. Οι νυχτερινές ενέργειες ξεκινούν τώρα.', narrDay: 'Η μέρα ξημέρωσε στο Παλέρμο. Ανοίξτε τα μάτια σας. Έχετε δύο λεπτά για να συζητήσετε τι συνέβη και ποιον εμπιστεύεστε.', narrVote: 'Η συζήτηση τελείωσε. Ώρα για ψηφοφορία. Επιλέξτε προσεκτικά. Μόλις κλειδώσετε την ψήφο σας, δεν αλλάζει.',
    reportBug: 'ΑΝΑΦΟΡΑ BUG',
    reportBugTitle: 'ΑΝΑΦΟΡΑ BUG',
    bugCategory: 'ΤΥΠΟΣ ΠΡΟΒΛΗΜΑΤΟΣ',
    bugDescription: 'ΤΙ ΣΥΝΕΒΗ;',
    bugGameplay: 'Gameplay',
    bugMultiplayer: 'Multiplayer',
    bugUi: 'Interface',
    bugAudio: 'Αφηγητής / Ήχος',
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

function normalizePlayerName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, 18)
}

function shuffle(items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function automaticRolesForPlayers(playerCount) {
  const count = Math.max(0, Number(playerCount) || 0)

  // Small games stay simple; extra special roles unlock as the lobby grows.
  const wanted = {
    visibleKiller: count >= 2 ? 1 : 0,
    hiddenKiller: count >= 6 ? 1 : 0,
    detective: count >= 3 ? 1 : 0,
    doctor: count >= 4 ? 1 : 0,
    lover: count >= 7 ? 2 : 0,
    madness: count >= 9 ? 1 : 0,
    kamikaze: count >= 10 ? 1 : 0,
  }

  return DEFAULT_ROLES.map(role => ({
    ...role,
    count: wanted[role.id] ?? 0,
  }))
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
  const [roleMode, setRoleMode] = useState('auto')
  const [ready, setReady] = useState(false)
  const [connectionState, setConnectionState] = useState('idle')
  const [connectionError, setConnectionError] = useState('')
  const [countdown, setCountdown] = useState(null)
  const [myRole, setMyRole] = useState(null)
  const [phase, setPhase] = useState('night')
  const [round, setRound] = useState(1)
  const [discussion, setDiscussion] = useState(120)
  const [vote, setVote] = useState('')
  const [voteLocked, setVoteLocked] = useState(false)
  const [micState, setMicState] = useState('idle')
  const [micError, setMicError] = useState('')
  const [muted, setMuted] = useState(false)
  const [voiceConnectedCount, setVoiceConnectedCount] = useState(0)
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
  const [howToOpen, setHowToOpen] = useState(false)
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
  const [phaseEndsAt, setPhaseEndsAt] = useState(0)
  const [gameStartsAt, setGameStartsAt] = useState(0)
  const [dayMessages, setDayMessages] = useState([])
  const [dayText, setDayText] = useState('')
  const [menuMusicOn, setMenuMusicOn] = useState(true)
  const [kamikazeUsed, setKamikazeUsed] = useState(false)
  const [authSession, setAuthSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authUsername, setAuthUsername] = useState('')
  const [profileNameDraft, setProfileNameDraft] = useState('')
  const [authStatus, setAuthStatus] = useState('idle')
  const [authMessage, setAuthMessage] = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [leaderboardOpen, setLeaderboardOpen] = useState(false)
  const [leaderboardRows, setLeaderboardRows] = useState([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [leaderboardError, setLeaderboardError] = useState('')
  const [shareStatus, setShareStatus] = useState('')
  const [matchHistory, setMatchHistory] = useState([])
  const [matchHistoryLoading, setMatchHistoryLoading] = useState(false)
  const [matchHistoryError, setMatchHistoryError] = useState('')
  const [resultBanner, setResultBanner] = useState(null)
  const [spectatorRoleRoster, setSpectatorRoleRoster] = useState([])

  const peerRef = useRef(null)
  const hostConnRef = useRef(null)
  const guestConnsRef = useRef(new Map())
  const pendingJoinConnsRef = useRef(new Map())
  const streamRef = useRef(null)
  const outgoingVoiceCallsRef = useRef(new Map())
  const incomingVoiceCallsRef = useRef(new Map())
  const remoteAudioRef = useRef(new Map())
  const voiceReconnectTimersRef = useRef(new Map())
  const playersRef = useRef([])
  const mutedRef = useRef(false)
  const isDeadRef = useRef(false)
  const sessionRejoinTokenRef = useRef('')
  const registryTokenRef = useRef('')
  const menuAudioRef = useRef(null)
  const uiAudioRef = useRef(null)
  const lastHoverButtonRef = useRef(null)
  const narratorQueueRef = useRef([])
  const narratorSpeakingRef = useRef(false)
  const playerVotesRef = useRef({})
  const killerVotesRef = useRef({})
  const doctorProtectedRef = useRef('')
  const gameRosterRef = useRef([])
  const phaseRef = useRef('night')
  const spectatorsRef = useRef([])
  const screenRef = useRef('language')
  const kamikazeUsedRef = useRef(new Set())
  const myRoleRef = useRef(null)
  const authSessionRef = useRef(null)
  const matchResultRecordedRef = useRef(false)
  const clockOffsetRef = useRef(0)
  const scheduledPhaseRef = useRef(null)
  const scheduledGameRef = useRef(null)
  const reconnectGraceTimersRef = useRef(new Map())
  const reconnectingRef = useRef(false)
  const clientKeyRef = useRef('')
  const reconnectRoomRef = useRef('')
  const privateRolesRef = useRef(new Map())
  const roundRef = useRef(1)
  const phaseEndsAtRef = useRef(0)
  const gameStartsAtRef = useRef(0)
  const dayMessagesRef = useRef([])
  const spectatorMessagesRef = useRef([])
  const isHostRef = useRef(false)
  const hostBackupRef = useRef(null)
  const hostMigrationRef = useRef(false)
  const hostMigrationTimerRef = useRef(null)
  const setupHostConnectionRef = useRef(null)
  const matchIdRef = useRef('')
  const reconnectGenerationRef = useRef(0)
  const t = key => TEXT[lang]?.[key] ?? TEXT.en[key] ?? key
  const roleName = role => t(role?.id || 'citizen')
  const syncedHostNow = () => Date.now() + (isHost ? 0 : clockOffsetRef.current)

  function showResultBanner(kind, title, detail = '') {
    setResultBanner({ kind, title, detail, id: Date.now() })
    setTimeout(() => {
      setResultBanner(current => current?.title === title ? null : current)
    }, 2400)
  }

  function clearScheduledGameTimers() {
    if (scheduledGameRef.current) clearTimeout(scheduledGameRef.current)
    scheduledGameRef.current = null
  }

  function applyPhaseSchedule(nextPhase, nextRound, startsAt, endsAt) {
    // The host is the only authority that advances game phases. Clients only
    // render the host-provided deadline and apply a phase after receiving it.
    if (scheduledPhaseRef.current) clearTimeout(scheduledPhaseRef.current)
    scheduledPhaseRef.current = null

    setPhase(nextPhase)
    phaseRef.current = nextPhase
    setRound(nextRound)
    setPhaseEndsAt(Number(endsAt || 0))
    setVote('')
    setVoteLocked(false)

    if (nextPhase === 'night') {
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
    } else if (nextPhase === 'vote') {
      setPlayerVotes({})
      playerVotesRef.current = {}
    }

    setTimeout(updateVoiceGate, 0)
  }

  function hostSchedulePhase(nextPhase, nextRound, durationSeconds) {
    if (!isHostRef.current) return
    const startsAt = Date.now()
    const endsAt = startsAt + durationSeconds * 1000
    applyPhaseSchedule(nextPhase, nextRound, startsAt, endsAt)
    broadcast({ type: 'phase-change', phase: nextPhase, round: nextRound, startsAt, endsAt })
  }
  const chooseLanguage = value => {
    setLang(value)
    let inviteCode = ''
    if (typeof window !== 'undefined') {
      inviteCode = String(new URLSearchParams(window.location.search).get('room') || '').trim().toUpperCase()
    }
    if (inviteCode) {
      setJoinCode(inviteCode)
      setScreen('join')
      screenRef.current = 'join'
    } else {
      setScreen('home')
      screenRef.current = 'home'
      if (menuMusicOn) startMenuMusic()
    }
  }
  const avatarUrl = profile?.avatar_url || ''

  function authHeaders(token = '') {
    return {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    }
  }

  function saveAuthSession(session) {
    setAuthSession(session || null)
    if (typeof window === 'undefined') return
    if (session?.refresh_token) localStorage.setItem('palermo-auth-v1', JSON.stringify(session))
    else localStorage.removeItem('palermo-auth-v1')
  }

  async function loadProfile(userId, token, preferredUsername = '') {
    if (!userId || !token) return null
    const headers = authHeaders(token)
    let res = await fetch(`${SUPABASE_URL}/rest/v1/palermo_profiles?id=eq.${encodeURIComponent(userId)}&select=*`, { headers, cache: 'no-store' })
    if (!res.ok) throw new Error('profile_load_failed')
    let rows = await res.json()
    let current = rows?.[0] || null
    if (!current) {
      const fallback = String(preferredUsername || authSession?.user?.user_metadata?.username || authEmail.split('@')[0] || 'Player').trim().slice(0, 18)
      res = await fetch(`${SUPABASE_URL}/rest/v1/palermo_profiles`, {
        method: 'POST',
        headers: { ...headers, Prefer: 'return=representation' },
        body: JSON.stringify({ id: userId, username: fallback || 'Player' }),
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        if (String(error?.code || '') === '23505') throw new Error('username_taken')
        throw new Error('profile_create_failed')
      }
      rows = await res.json()
      current = rows?.[0] || null
    }
    setProfile(current)
    if (current?.username) {
      setName(current.username)
      setProfileNameDraft(current.username)
    }
    return current
  }

  async function restoreAuth() {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('palermo-auth-v1')
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      if (!parsed?.refresh_token) return
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ refresh_token: parsed.refresh_token }),
      })
      if (!res.ok) throw new Error('refresh_failed')
      const session = await res.json()
      saveAuthSession(session)
      await loadProfile(session.user?.id, session.access_token, session.user?.user_metadata?.username)
    } catch {
      saveAuthSession(null)
      setProfile(null)
    }
  }

  async function submitAuth() {
    setAuthStatus('loading')
    setAuthMessage('')
    try {
      if (!authEmail.trim() || authPassword.length < 6) throw new Error('missing_auth')
      if (authMode === 'signup' && authUsername.trim().length < 2) throw new Error('missing_username')
      const endpoint = authMode === 'signup' ? 'signup' : 'token?grant_type=password'
      const payload = authMode === 'signup'
        ? { email: authEmail.trim(), password: authPassword, data: { username: authUsername.trim().slice(0, 18) } }
        : { email: authEmail.trim(), password: authPassword }
      const res = await fetch(`${SUPABASE_URL}/auth/v1/${endpoint}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.msg || data?.message || 'auth_failed')
      if (!data?.access_token) {
        setAuthStatus('idle')
        setAuthMessage(lang === 'el' ? 'Έλεγξε το email σου για επιβεβαίωση και μετά κάνε σύνδεση.' : 'Check your email to confirm the account, then sign in.')
        setAuthMode('login')
        return
      }
      saveAuthSession(data)
      await loadProfile(data.user?.id, data.access_token, authMode === 'signup' ? authUsername : data.user?.user_metadata?.username)
      setAuthStatus('success')
      setAuthMessage('')
      setAuthPassword('')
      setTimeout(() => setAuthOpen(false), 250)
    } catch (error) {
      setAuthStatus('error')
      const key = error?.message
      setAuthMessage(
        key === 'username_taken'
          ? (lang === 'el' ? 'Αυτό το username χρησιμοποιείται ήδη.' : 'That username is already taken.')
          : key === 'missing_username'
          ? (lang === 'el' ? 'Βάλε username με τουλάχιστον 2 χαρακτήρες.' : 'Choose a username with at least 2 characters.')
          : key === 'missing_auth'
          ? (lang === 'el' ? 'Βάλε έγκυρο email και password τουλάχιστον 6 χαρακτήρων.' : 'Enter a valid email and a password with at least 6 characters.')
          : (error?.message || (lang === 'el' ? 'Η σύνδεση απέτυχε.' : 'Sign in failed.'))
      )
    }
  }

  async function logoutAccount() {
    try {
      if (authSession?.access_token) {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: 'POST',
          headers: authHeaders(authSession.access_token),
        })
      }
    } catch {}
    saveAuthSession(null)
    setProfile(null)
    setMatchHistory([])
    setName('')
    setProfileNameDraft('')
    setAuthOpen(false)
  }

  async function saveProfileName() {
    const nextName = profileNameDraft.trim().slice(0, 18)
    if (!authSession?.user?.id || !authSession?.access_token || nextName.length < 2) return
    setAuthStatus('loading')
    setAuthMessage('')
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/palermo_profiles?id=eq.${encodeURIComponent(authSession.user.id)}`, {
        method: 'PATCH',
        headers: { ...authHeaders(authSession.access_token), Prefer: 'return=representation' },
        body: JSON.stringify({ username: nextName, updated_at: new Date().toISOString() }),
      })
      const data = await res.json().catch(() => [])
      if (!res.ok) {
        const first = Array.isArray(data) ? data[0] : data
        if (String(first?.code || '') === '23505') throw new Error('username_taken')
        throw new Error('profile_update_failed')
      }
      const nextProfile = data?.[0]
      if (nextProfile) setProfile(nextProfile)
      setName(nextName)
      setAuthStatus('success')
      setAuthMessage(lang === 'el' ? 'Το προφίλ αποθηκεύτηκε.' : 'Profile saved.')
    } catch (error) {
      setAuthStatus('error')
      setAuthMessage(error?.message === 'username_taken'
        ? (lang === 'el' ? 'Αυτό το username χρησιμοποιείται ήδη.' : 'That username is already taken.')
        : (lang === 'el' ? 'Δεν ήταν δυνατή η αποθήκευση.' : 'Could not save the profile.'))
    }
  }

  async function uploadAvatar(file) {
    if (!file || !authSession?.user?.id || !authSession?.access_token) return
    if (!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setAuthStatus('error')
      setAuthMessage(lang === 'el' ? 'Χρησιμοποίησε JPG, PNG, WEBP ή GIF έως 2MB.' : 'Use JPG, PNG, WEBP, or GIF up to 2MB.')
      return
    }
    setAvatarUploading(true)
    setAuthMessage('')
    try {
      const ext = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1]
      const objectPath = `${authSession.user.id}/avatar.${ext}`
      const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/palermo-avatars/${objectPath}`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${authSession.access_token}`,
          'Content-Type': file.type,
          'x-upsert': 'true',
        },
        body: file,
      })
      if (!uploadRes.ok) throw new Error('avatar_upload_failed')
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/palermo-avatars/${objectPath}?v=${Date.now()}`
      const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/palermo_profiles?id=eq.${encodeURIComponent(authSession.user.id)}`, {
        method: 'PATCH',
        headers: { ...authHeaders(authSession.access_token), Prefer: 'return=representation' },
        body: JSON.stringify({ avatar_url: publicUrl, updated_at: new Date().toISOString() }),
      })
      const rows = await profileRes.json().catch(() => [])
      if (!profileRes.ok) throw new Error('avatar_profile_failed')
      if (rows?.[0]) setProfile(rows[0])
      setAuthStatus('success')
      setAuthMessage(lang === 'el' ? 'Η φωτογραφία προφίλ ενημερώθηκε.' : 'Profile picture updated.')
    } catch {
      setAuthStatus('error')
      setAuthMessage(lang === 'el' ? 'Δεν ήταν δυνατή η μεταφόρτωση της εικόνας.' : 'Could not upload the image.')
    } finally {
      setAvatarUploading(false)
    }
  }

  async function fetchMatchHistory() {
    const session = authSessionRef.current
    if (!session?.user?.id || !session?.access_token) {
      setMatchHistory([])
      return
    }
    setMatchHistoryLoading(true)
    setMatchHistoryError('')
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/palermo_match_history?user_id=eq.${encodeURIComponent(session.user.id)}&select=id,match_id,role_id,winner,won,mvp,rounds,player_count,created_at&order=created_at.desc&limit=12`,
        { headers: authHeaders(session.access_token), cache: 'no-store' }
      )
      if (!res.ok) throw new Error('match_history_failed')
      const rows = await res.json()
      setMatchHistory(Array.isArray(rows) ? rows : [])
    } catch {
      setMatchHistory([])
      setMatchHistoryError(lang === 'el' ? 'Δεν ήταν δυνατή η φόρτωση του ιστορικού αγώνων.' : 'Could not load match history.')
    } finally {
      setMatchHistoryLoading(false)
    }
  }

  async function fetchLeaderboard() {
    setLeaderboardLoading(true)
    setLeaderboardError('')
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/palermo_profiles?select=id,username,avatar_url,games_played,wins,losses,mvps&games_played=gt.0&order=wins.desc,mvps.desc,games_played.asc&limit=100`, {
        headers: REGISTRY_HEADERS,
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('leaderboard_failed')
      const rows = await res.json()
      setLeaderboardRows(Array.isArray(rows) ? rows : [])
    } catch {
      setLeaderboardRows([])
      setLeaderboardError(lang === 'el' ? 'Δεν ήταν δυνατή η φόρτωση του leaderboard.' : 'Could not load the leaderboard.')
    } finally {
      setLeaderboardLoading(false)
    }
  }

  function openLeaderboard() {
    setLeaderboardOpen(true)
    fetchLeaderboard()
  }

  function didRoleWin(winner, roleId) {
    if (!winner || !roleId) return false
    if (winner === 'madness') return roleId === 'madness'
    if (winner === 'killers') return roleId === 'visibleKiller' || roleId === 'hiddenKiller'
    if (winner === 'citizens') return roleId !== 'visibleKiller' && roleId !== 'hiddenKiller' && roleId !== 'madness'
    return false
  }

  async function recordMatchResult(winner, mvpName) {
    const session = authSessionRef.current
    const roleId = myRoleRef.current?.id
    const matchId = matchIdRef.current
    if (!session?.access_token || !roleId || !matchId || matchResultRecordedRef.current) return
    matchResultRecordedRef.current = true
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/palermo_record_match_result_v2`, {
        method: 'POST',
        headers: authHeaders(session.access_token),
        body: JSON.stringify({
          p_match_id: matchId,
          p_won: didRoleWin(winner, roleId),
          p_mvp: !!mvpName && String(mvpName) === String(name),
          p_role_id: roleId,
          p_winner: winner || 'unknown',
          p_rounds: Math.max(1, Number(roundRef.current || 1)),
          p_player_count: gameRosterRef.current.length,
        }),
      })
      if (!res.ok) throw new Error('stats_update_failed')
      const data = await res.json()
      const updated = Array.isArray(data) ? data[0] : data
      if (updated?.id) setProfile(updated)
      fetchMatchHistory()
    } catch {
      matchResultRecordedRef.current = false
    }
  }

  function createAudioContext() {
    if (typeof window === 'undefined') return null
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return null
    try { return new AudioCtx() } catch { return null }
  }

  function ensureUiAudio() {
    let audio = uiAudioRef.current
    if (!audio?.ctx || audio.ctx.state === 'closed') {
      const ctx = createAudioContext()
      if (!ctx) return null
      const master = ctx.createGain()
      master.gain.value = 0.17
      master.connect(ctx.destination)
      audio = { ctx, master }
      uiAudioRef.current = audio
    }
    if (audio.ctx.state === 'suspended') audio.ctx.resume?.().catch(() => {})
    return audio
  }

  function playUiSound(kind = 'hover') {
    const audio = ensureUiAudio()
    if (!audio) return
    const { ctx, master } = audio
    const now = ctx.currentTime

    if (kind === 'hover') {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(520, now)
      osc.frequency.exponentialRampToValueAtTime(430, now + 0.055)
      filter.type = 'lowpass'
      filter.frequency.value = 1900
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.055, now + 0.007)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075)
      osc.connect(filter)
      filter.connect(gain)
      gain.connect(master)
      osc.start(now)
      osc.stop(now + 0.09)
      return
    }

    const body = ctx.createOscillator()
    const tick = ctx.createOscillator()
    const bodyGain = ctx.createGain()
    const tickGain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    body.type = 'triangle'
    body.frequency.setValueAtTime(145, now)
    body.frequency.exponentialRampToValueAtTime(92, now + 0.085)
    bodyGain.gain.setValueAtTime(0.0001, now)
    bodyGain.gain.exponentialRampToValueAtTime(0.12, now + 0.006)
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12)

    tick.type = 'square'
    tick.frequency.setValueAtTime(820, now)
    tickGain.gain.setValueAtTime(0.035, now)
    tickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025)

    filter.type = 'lowpass'
    filter.frequency.value = 1000

    body.connect(filter)
    filter.connect(bodyGain)
    bodyGain.connect(master)
    tick.connect(tickGain)
    tickGain.connect(master)

    body.start(now)
    tick.start(now)
    body.stop(now + 0.14)
    tick.stop(now + 0.04)
  }

  function startMenuMusic() {
    if (!menuMusicOn || typeof window === 'undefined' || menuAudioRef.current) return
    try {
      const ctx = createAudioContext()
      if (!ctx) return

      const master = ctx.createGain()
      const compressor = ctx.createDynamicsCompressor()
      const lowpass = ctx.createBiquadFilter()
      master.gain.value = 0.065
      lowpass.type = 'lowpass'
      lowpass.frequency.value = 3200
      lowpass.Q.value = 0.35
      compressor.threshold.value = -18
      compressor.knee.value = 18
      compressor.ratio.value = 3
      compressor.attack.value = 0.02
      compressor.release.value = 0.45
      master.connect(lowpass)
      lowpass.connect(compressor)
      compressor.connect(ctx.destination)

      const ambience = ctx.createGain()
      ambience.gain.value = 0.23
      ambience.connect(master)

      // A low, smoky room tone under the score.
      const droneA = ctx.createOscillator()
      const droneB = ctx.createOscillator()
      const droneGainA = ctx.createGain()
      const droneGainB = ctx.createGain()
      droneA.type = 'sine'
      droneB.type = 'triangle'
      droneA.frequency.value = 43.65
      droneB.frequency.value = 65.41
      droneGainA.gain.value = 0.17
      droneGainB.gain.value = 0.045
      droneA.connect(droneGainA)
      droneB.connect(droneGainB)
      droneGainA.connect(ambience)
      droneGainB.connect(ambience)
      droneA.start()
      droneB.start()

      const tremolo = ctx.createOscillator()
      const tremoloGain = ctx.createGain()
      tremolo.frequency.value = 0.07
      tremoloGain.gain.value = 0.018
      tremolo.connect(tremoloGain)
      tremoloGain.connect(master.gain)
      tremolo.start()

      // Very soft filtered noise gives it a vinyl / smoky-room texture.
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
      const noiseData = noiseBuffer.getChannelData(0)
      for (let i = 0; i < noiseData.length; i += 1) {
        noiseData[i] = (Math.random() * 2 - 1) * 0.19
      }
      const noise = ctx.createBufferSource()
      const noiseFilter = ctx.createBiquadFilter()
      const noiseGain = ctx.createGain()
      noise.buffer = noiseBuffer
      noise.loop = true
      noiseFilter.type = 'bandpass'
      noiseFilter.frequency.value = 1350
      noiseFilter.Q.value = 0.45
      noiseGain.gain.value = 0.018
      noise.connect(noiseFilter)
      noiseFilter.connect(noiseGain)
      noiseGain.connect(master)
      noise.start()

      const activeNodes = new Set()
      const bpm = 66
      const beat = 60 / bpm
      const bar = beat * 4
      // D minor / noir-jazz colors: Dm, Bb, Gm, A7.
      const chords = [
        [73.42, 87.31, 110.00],
        [58.27, 73.42, 87.31],
        [49.00, 58.27, 73.42],
        [55.00, 69.30, 82.41],
      ]
      const bass = [36.71, 29.14, 24.50, 27.50]
      const melody = [
        [293.66, 261.63, 220.00, 261.63],
        [233.08, 220.00, 174.61, 220.00],
        [196.00, 174.61, 146.83, 174.61],
        [220.00, 207.65, 164.81, 184.99],
      ]

      function scheduleNote(freq, when, duration, volume, type = 'triangle', cutoff = 1800) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const filter = ctx.createBiquadFilter()
        osc.type = type
        osc.frequency.setValueAtTime(freq, when)
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(cutoff, when)
        filter.frequency.exponentialRampToValueAtTime(Math.max(260, cutoff * 0.52), when + duration)
        gain.gain.setValueAtTime(0.0001, when)
        gain.gain.exponentialRampToValueAtTime(volume, when + Math.min(0.025, duration * 0.12))
        gain.gain.exponentialRampToValueAtTime(0.0001, when + duration)
        osc.connect(filter)
        filter.connect(gain)
        gain.connect(master)
        osc.start(when)
        osc.stop(when + duration + 0.03)
        activeNodes.add(osc)
        osc.onended = () => activeNodes.delete(osc)
      }

      let barIndex = 0
      let nextBarAt = ctx.currentTime + 0.12

      function scheduleBar() {
        const chordIndex = barIndex % chords.length
        const when = Math.max(ctx.currentTime + 0.04, nextBarAt)

        // Upright-bass-like low pulse.
        scheduleNote(bass[chordIndex], when, beat * 0.72, 0.18, 'sine', 520)
        scheduleNote(bass[chordIndex] * 2, when + beat * 2, beat * 0.5, 0.065, 'triangle', 650)

        // Soft muted-piano chord stabs.
        chords[chordIndex].forEach((freq, index) => {
          scheduleNote(freq * 2, when + beat * 0.06 + index * 0.018, beat * 1.6, 0.028, 'triangle', 1500)
        })

        // Sparse detective-theme melody.
        melody[chordIndex].forEach((freq, index) => {
          const offset = [0.72, 1.52, 2.52, 3.2][index] * beat
          scheduleNote(freq, when + offset, beat * 0.45, index === 0 ? 0.035 : 0.026, 'sine', 2200)
        })

        barIndex += 1
        nextBarAt = when + bar
      }

      scheduleBar()
      const scheduler = setInterval(() => {
        if (ctx.state === 'suspended') ctx.resume?.().catch(() => {})
        while (nextBarAt < ctx.currentTime + bar * 1.3) scheduleBar()
      }, 350)

      menuAudioRef.current = {
        ctx,
        master,
        droneA,
        droneB,
        tremolo,
        noise,
        scheduler,
        activeNodes,
      }
    } catch {}
  }

  function stopMenuMusic() {
    const audio = menuAudioRef.current
    if (!audio) return
    try {
      clearInterval(audio.scheduler)
      audio.activeNodes?.forEach(node => { try { node.stop() } catch {} })
      audio.droneA?.stop()
      audio.droneB?.stop()
      audio.tremolo?.stop()
      audio.noise?.stop()
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

  function pickNarratorVoice() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
    const voices = window.speechSynthesis.getVoices?.() || []
    const languagePrefix = lang === 'el' ? 'el' : 'en'
    const candidates = voices.filter(v => v.lang?.toLowerCase().startsWith(languagePrefix))
    if (!candidates.length) return null

    const preferredNames = lang === 'el'
      ? ['Google Ελληνικά', 'Microsoft Stefanos', 'Microsoft Athina']
      : ['Microsoft Guy', 'Microsoft Ryan', 'Google UK English Male', 'Google US English']

    for (const preferredName of preferredNames) {
      const match = candidates.find(v => v.name?.toLowerCase().includes(preferredName.toLowerCase()))
      if (match) return match
    }

    return candidates.find(v => !/compact|espeak/i.test(v.name || '')) || candidates[0]
  }

  function runNarratorQueue() {
    if (!narratorOn || narratorSpeakingRef.current || typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const item = narratorQueueRef.current.shift()
    if (!item) return

    narratorSpeakingRef.current = true
    const utterance = new SpeechSynthesisUtterance(item.text)
    utterance.lang = lang === 'el' ? 'el-GR' : 'en-US'
    const preferred = pickNarratorVoice()
    if (preferred) utterance.voice = preferred
    utterance.rate = item.rate ?? 0.9
    utterance.pitch = item.pitch ?? 0.92
    utterance.volume = 1

    utterance.onend = () => {
      narratorSpeakingRef.current = false
      setTimeout(runNarratorQueue, item.pauseAfter ?? 220)
    }
    utterance.onerror = () => {
      narratorSpeakingRef.current = false
      setTimeout(runNarratorQueue, 80)
    }

    window.speechSynthesis.speak(utterance)
  }

  function speak(text, options = {}) {
    if (!narratorOn || typeof window === 'undefined' || !('speechSynthesis' in window) || !text) return

    if (options.interrupt) {
      narratorQueueRef.current = []
      narratorSpeakingRef.current = false
      window.speechSynthesis.cancel()
    }

    narratorQueueRef.current.push({
      text: String(text),
      rate: options.rate,
      pitch: options.pitch,
      pauseAfter: options.pauseAfter,
    })
    runNarratorQueue()
  }

  function stopNarrator() {
    narratorQueueRef.current = []
    narratorSpeakingRef.current = false
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel?.()
  }



  useEffect(() => { gameRosterRef.current = gameRoster }, [gameRoster])
  useEffect(() => { playersRef.current = players }, [players])
  useEffect(() => {
    if (!isHost || screen !== 'lobby' || roleMode !== 'auto') return
    const nextRoles = automaticRolesForPlayers(players.length)
    const changed = nextRoles.some((role, index) => role.count !== (roles[index]?.count ?? 0))
    if (!changed) return

    setRoles(nextRoles)
    setTimeout(() => {
      broadcast({
        type: 'room-state',
        players: playersRef.current,
        spectators: spectatorsRef.current,
        maxPlayers,
        maxSpectators,
        roles: nextRoles,
        roleMode: 'auto',
      })
    }, 0)
  }, [isHost, screen, players.length, roleMode])
  useEffect(() => { mutedRef.current = muted }, [muted])
  useEffect(() => { isDeadRef.current = isDead }, [isDead])
  useEffect(() => { phaseRef.current = phase }, [phase])
  useEffect(() => { spectatorsRef.current = spectators }, [spectators])
  useEffect(() => { screenRef.current = screen }, [screen])
  useEffect(() => { myRoleRef.current = myRole }, [myRole])
  useEffect(() => { authSessionRef.current = authSession }, [authSession])
  useEffect(() => { isHostRef.current = isHost }, [isHost])
  useEffect(() => { setupHostConnectionRef.current = setupHostConnection })
  useEffect(() => { roundRef.current = round }, [round])
  useEffect(() => { phaseEndsAtRef.current = phaseEndsAt }, [phaseEndsAt])
  useEffect(() => { gameStartsAtRef.current = gameStartsAt }, [gameStartsAt])
  useEffect(() => { dayMessagesRef.current = dayMessages }, [dayMessages])
  useEffect(() => { spectatorMessagesRef.current = spectatorMessages }, [spectatorMessages])
  useEffect(() => {
    if (typeof window === 'undefined') return
    let key = localStorage.getItem('palermo-client-key')
    if (!key) {
      key = crypto.randomUUID()
      localStorage.setItem('palermo-client-key', key)
    }
    clientKeyRef.current = key
  }, [])
  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = localStorage.getItem('palermo-reconnect-v1')
    if (!raw) return
    try {
      const saved = JSON.parse(raw)
      if (!saved?.roomCode || !saved?.clientKey || Date.now() - Number(saved.savedAt || 0) > 10 * 60 * 1000) {
        localStorage.removeItem('palermo-reconnect-v1')
        return
      }
      clientKeyRef.current = saved.clientKey
      localStorage.setItem('palermo-client-key', saved.clientKey)
      reconnectRoomRef.current = saved.roomCode
      setRoomCode(saved.roomCode)
      setJoinCode(saved.roomCode)
      setJoinMode(saved.mode === 'spectator' ? 'spectator' : 'player')
      if (saved.name) setName(saved.name)
      let tries = 0
      const timer = setInterval(() => {
        tries += 1
        if (getPeer()) {
          clearInterval(timer)
          attemptGuestReconnect(saved.roomCode)
        } else if (tries >= 15) {
          clearInterval(timer)
        }
      }, 300)
      return () => clearInterval(timer)
    } catch {
      localStorage.removeItem('palermo-reconnect-v1')
    }
  }, [])
  useEffect(() => { restoreAuth() }, [])

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
    if (screen !== 'role' || !gameStartsAt) return
    const tick = () => {
      setCountdown(Math.max(0, Math.ceil((gameStartsAt - syncedHostNow()) / 1000)))
    }
    tick()
    const timer = setInterval(tick, 100)
    return () => clearInterval(timer)
  }, [screen, gameStartsAt, isHost])

  useEffect(() => {
    if (screen !== 'game' || !phaseEndsAt) return
    let hostAdvanced = false

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((phaseEndsAt - syncedHostNow()) / 1000))
      if (phase === 'night') setNightTimer(remaining)
      if (phase === 'day') setDiscussion(remaining)
      if (phase === 'vote') setVoteTimer(remaining)

      if (remaining <= 0 && isHost && !hostAdvanced) {
        hostAdvanced = true
        if (phase === 'night') resolveKillerVotes(killerVotesRef.current, doctorProtectedRef.current)
        else if (phase === 'day') hostSchedulePhase('vote', round, 30)
        else if (phase === 'vote') resolveDayVote(playerVotesRef.current)
      }
    }

    tick()
    const timer = setInterval(tick, 200)
    return () => clearInterval(timer)
  }, [screen, phase, phaseEndsAt, round, isHost])

  useEffect(() => {
    if (micState === 'granted') {
      ensureVoiceCalls()
      updateVoiceGate()
    }
  }, [micState, players, screen, phase, isDead, muted, gameRoster])

  useEffect(() => {
    if (micState !== 'granted' || !['lobby','game'].includes(screen)) return
    const timer = setInterval(() => {
      ensureVoiceCalls()
      updateVoiceGate()
    }, 3000)
    return () => clearInterval(timer)
  }, [micState, screen, players.length])

  useEffect(() => {
    if (!isHost || !roomCode || !['lobby','role','game'].includes(screen)) return
    sendHostBackupState()
    const timer = setInterval(sendHostBackupState, 750)
    return () => clearInterval(timer)
  }, [isHost, roomCode, screen, roomName, accessMode, accessCode, maxPlayers, maxSpectators, roles, roleMode, narratorOn, lang, voteScores, nightResolvedTarget, nightSaved, gameWinner, gameMvp])

  useEffect(() => {
    if (isHost || !['lobby','role','game'].includes(screen)) return
    const ping = () => {
      if (hostConnRef.current?.open) {
        hostConnRef.current.send({ type: 'clock-sync-ping', clientSentAt: Date.now() })
      }
    }
    ping()
    const timer = setInterval(ping, 3000)
    return () => clearInterval(timer)
  }, [isHost, screen, connectionState])

  useEffect(() => {
    const musicScreens = ['home', 'join', 'lobby', 'gameOver']
    if (musicScreens.includes(screen) && menuMusicOn) startMenuMusic()
    if (!musicScreens.includes(screen)) stopMenuMusic()
  }, [screen, menuMusicOn])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const soundScreens = ['language', 'home', 'join', 'lobby', 'gameOver']
    if (!soundScreens.includes(screen)) return

    const root = document.querySelector('.palermoShell')
    if (!root) return

    const onPointerOver = event => {
      const button = event.target?.closest?.('button')
      if (!button || button.disabled || !root.contains(button)) return
      if (event.relatedTarget && button.contains(event.relatedTarget)) return
      if (lastHoverButtonRef.current === button) return
      lastHoverButtonRef.current = button
      playUiSound('hover')
    }

    const onPointerOut = event => {
      const button = event.target?.closest?.('button')
      if (!button) return
      if (event.relatedTarget && button.contains(event.relatedTarget)) return
      if (lastHoverButtonRef.current === button) lastHoverButtonRef.current = null
    }

    const onClick = event => {
      const button = event.target?.closest?.('button')
      if (!button || button.disabled || !root.contains(button)) return
      playUiSound('click')
    }

    root.addEventListener('pointerover', onPointerOver)
    root.addEventListener('pointerout', onPointerOut)
    root.addEventListener('click', onClick)

    return () => {
      lastHoverButtonRef.current = null
      root.removeEventListener('pointerover', onPointerOver)
      root.removeEventListener('pointerout', onPointerOut)
      root.removeEventListener('click', onClick)
    }
  }, [screen])

  useEffect(() => {
    if (screen !== 'role' || !myRole) return
    const roleLabel = roleName(myRole)
    let extra = ''
    if ((myRole.id === 'visibleKiller' || myRole.id === 'hiddenKiller') && myRole.killerTeammates?.length) {
      extra = lang === 'el'
        ? ` Ο άλλος δολοφόνος είναι ${myRole.killerTeammates.join(', ')}. Συνεργαστείτε χωρίς να αποκαλυφθείτε.`
        : ` Your fellow killer is ${myRole.killerTeammates.join(', ')}. Work together without revealing yourselves.`
    } else if (myRole.id === 'detective' && myRole.knownVisibleKiller) {
      extra = lang === 'el'
        ? ` Γνωρίζεις ότι ο Φανερός Δολοφόνος είναι ο ${myRole.knownVisibleKiller}. Χρησιμοποίησε αυτή την πληροφορία προσεκτικά.`
        : ` You know that the Revealed Killer is ${myRole.knownVisibleKiller}. Use that information carefully.`
    } else if (myRole.id === 'lover' && myRole.loverPartner) {
      extra = lang === 'el'
        ? ` Είσαι συνδεδεμένος με τον παίκτη ${myRole.loverPartner}. Αν πεθάνει ένας από εσάς, πεθαίνει και ο άλλος.`
        : ` You are linked with ${myRole.loverPartner}. If either of you dies, the other dies too.`
    }
    speak(`${t('narrRole')} ${roleLabel}.${extra}`, { interrupt: true, rate: 0.88, pitch: 0.9 })
  }, [screen, myRole, lang, narratorOn])

  useEffect(() => {
    if (screen !== 'game') return

    if (phase === 'night') {
      speak(t('narrNight'), { interrupt: true, rate: 0.88, pitch: 0.88, pauseAfter: 350 })
    }

    if (phase === 'day') {
      const morning = nightResolvedTarget
        ? (lang === 'el'
            ? `Η νύχτα τελείωσε. Ο παίκτης ${nightResolvedTarget} δεν επέζησε.`
            : `The night is over. ${nightResolvedTarget} did not survive.`)
        : (lang === 'el'
            ? 'Η νύχτα τελείωσε. Κανείς δεν πέθανε.'
            : 'The night is over. No one died.')

      speak(morning, { interrupt: true, rate: 0.86, pitch: 0.88, pauseAfter: 500 })
      speak(t('narrDay'), { rate: 0.91, pitch: 0.94 })
    }

    if (phase === 'vote') {
      speak(t('narrVote'), { interrupt: true, rate: 0.89, pitch: 0.9 })
    }
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
          host_name: cleanName,
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
      stopNarrator()
      clearScheduledGameTimers()
      if (scheduledPhaseRef.current) clearTimeout(scheduledPhaseRef.current)
      peerRef.current?.destroy?.()
      closeAllVoice()
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      stopMenuMusic()
      try { uiAudioRef.current?.ctx?.close?.() } catch {}
      uiAudioRef.current = null
    }
  }, [])

  function stopRemoteAudio(peerId) {
    const audio = remoteAudioRef.current.get(peerId)
    if (audio) {
      try {
        audio.pause()
        audio.srcObject = null
        audio.remove?.()
      } catch {}
      remoteAudioRef.current.delete(peerId)
      refreshVoiceConnectedCount()
    }
  }

  function closeOutgoingVoice(peerId) {
    const call = outgoingVoiceCallsRef.current.get(peerId)
    if (call) {
      try { call.close() } catch {}
      outgoingVoiceCallsRef.current.delete(peerId)
    }
  }

  function closeIncomingVoice(peerId) {
    const call = incomingVoiceCallsRef.current.get(peerId)
    if (call) {
      try { call.close() } catch {}
      incomingVoiceCallsRef.current.delete(peerId)
    }
    stopRemoteAudio(peerId)
  }

  function closeVoiceCall(peerId) {
    closeOutgoingVoice(peerId)
    closeIncomingVoice(peerId)
  }

  function attachIncomingVoiceCall(call) {
    if (!call?.peer) return
    const peerId = call.peer

    const existing = incomingVoiceCallsRef.current.get(peerId)
    if (existing && existing !== call) {
      try { existing.close() } catch {}
      incomingVoiceCallsRef.current.delete(peerId)
      stopRemoteAudio(peerId)
    }

    incomingVoiceCallsRef.current.set(peerId, call)

    call.on('stream', remoteStream => {
      let audio = remoteAudioRef.current.get(peerId)
      if (!audio) {
        audio = document.createElement('audio')
        audio.autoplay = true
        audio.playsInline = true
        audio.setAttribute('playsinline', '')
        audio.style.display = 'none'
        document.body.appendChild(audio)
        remoteAudioRef.current.set(peerId, audio)
      }

      audio.srcObject = remoteStream
      audio.play().catch(() => {})
      refreshVoiceConnectedCount()
      updateVoiceGate()
    })

    call.on('close', () => {
      if (incomingVoiceCallsRef.current.get(peerId) === call) {
        incomingVoiceCallsRef.current.delete(peerId)
        stopRemoteAudio(peerId)
      }
      refreshVoiceConnectedCount()
    })

    call.on('error', () => {
      if (incomingVoiceCallsRef.current.get(peerId) === call) {
        incomingVoiceCallsRef.current.delete(peerId)
        stopRemoteAudio(peerId)
      }
      refreshVoiceConnectedCount()
    })
  }

  function attachOutgoingVoiceCall(call) {
    if (!call?.peer) return
    const peerId = call.peer
    const existing = outgoingVoiceCallsRef.current.get(peerId)
    if (existing && existing !== call) {
      try { existing.close() } catch {}
    }
    outgoingVoiceCallsRef.current.set(peerId, call)

    call.on('close', () => {
      if (outgoingVoiceCallsRef.current.get(peerId) === call) {
        outgoingVoiceCallsRef.current.delete(peerId)
        scheduleVoiceReconnect(peerId)
      }
    })
    call.on('error', () => {
      if (outgoingVoiceCallsRef.current.get(peerId) === call) {
        outgoingVoiceCallsRef.current.delete(peerId)
        scheduleVoiceReconnect(peerId)
      }
    })
  }

  function handleIncomingVoiceCall(call) {
    const peerId = call?.peer
    const allowed =
      playersRef.current.some(p => p.id === peerId) ||
      guestConnsRef.current.has(peerId) ||
      hostConnRef.current?.peer === peerId

    if (!allowed) {
      try { call.close() } catch {}
      return
    }

    try {
      // Incoming calls are receive-only. Each player sends their own mic on a
      // separate outgoing call, so enabling microphones in any order works.
      call.answer()
      attachIncomingVoiceCall(call)
    } catch {
      try { call.close() } catch {}
    }
  }

  function startVoiceCallTo(peerId, force = false) {
    const peer = peerRef.current
    const stream = streamRef.current
    if (!peer?.id || !stream || !peerId || peerId === peer.id) return

    if (!force && outgoingVoiceCallsRef.current.has(peerId)) return
    if (force) closeOutgoingVoice(peerId)

    try {
      const call = peer.call(peerId, stream, { metadata: { kind: 'palermo-oneway-voice' } })
      if (call) attachOutgoingVoiceCall(call)
    } catch {}
  }

  function reconnectVoicePeer(peerId) {
    const localId = peerRef.current?.id
    if (!localId || !peerId || !streamRef.current || localId === peerId) return
    setTimeout(() => startVoiceCallTo(peerId, true), 120)
  }

  function announceVoiceReady() {
    const myId = peerRef.current?.id
    if (!myId) return
    if (isHost) {
      broadcast({ type: 'voice-peer-ready', peerId: myId })
    } else {
      hostConnRef.current?.send({ type: 'voice-ready', peerId: myId })
    }
    ensureVoiceCalls(true)
  }

  function ensureVoiceCalls(force = false) {
    const peer = peerRef.current
    const stream = streamRef.current
    if (!peer?.id || !stream) return

    playersRef.current.forEach(player => {
      if (!player?.id || player.id === peer.id) return
      startVoiceCallTo(player.id, force && !outgoingVoiceCallsRef.current.has(player.id))
    })
  }

  function updateVoiceGate() {
    const localId = peerRef.current?.id
    const roster = gameRosterRef.current
    const me = roster.find(p => p.id === localId)
    const lobbyOpen = screenRef.current === 'lobby' && playersRef.current.some(p => p.id === localId)
    const dayOpen = screenRef.current === 'game' && phaseRef.current === 'day' && !!me?.alive
    const transmit = (lobbyOpen || dayOpen) && !mutedRef.current && !isDeadRef.current

    streamRef.current?.getAudioTracks?.().forEach(track => {
      track.enabled = transmit
    })

    remoteAudioRef.current.forEach((audio, peerId) => {
      const remoteInLobby = playersRef.current.some(p => p.id === peerId)
      const remoteAlive = roster.some(p => p.id === peerId && p.alive)
      const shouldHear = (lobbyOpen && remoteInLobby) || (dayOpen && remoteAlive)
      try {
        audio.muted = !shouldHear
        audio.volume = shouldHear ? 1 : 0
        if (shouldHear) audio.play().catch(() => {})
        else audio.pause()
      } catch {}
    })
  }

  function closeAllVoice() {
    outgoingVoiceCallsRef.current.forEach(call => { try { call.close() } catch {} })
    outgoingVoiceCallsRef.current.clear()
    incomingVoiceCallsRef.current.forEach(call => { try { call.close() } catch {} })
    incomingVoiceCallsRef.current.clear()
    remoteAudioRef.current.forEach(audio => {
      try {
        audio.pause()
        audio.srcObject = null
        audio.remove?.()
      } catch {}
    })
    remoteAudioRef.current.clear()
    voiceReconnectTimersRef.current.forEach(timer => clearTimeout(timer))
    voiceReconnectTimersRef.current.clear()
    setVoiceConnectedCount(0)
  }

  function getPeer() {
    return window.Peer
  }

  function makePeer(id) {
    const Peer = getPeer()
    if (!Peer) return null
    return id ? new Peer(id, PEER_OPTIONS) : new Peer(PEER_OPTIONS)
  }

  function refreshVoiceConnectedCount() {
    setVoiceConnectedCount([...remoteAudioRef.current.values()].filter(audio => !!audio?.srcObject).length)
  }

  function scheduleVoiceReconnect(peerId) {
    if (!peerId || micState !== 'granted') return
    clearTimeout(voiceReconnectTimersRef.current.get(peerId))
    const timer = setTimeout(() => {
      voiceReconnectTimersRef.current.delete(peerId)
      reconnectVoicePeer(peerId)
      ensureVoiceCalls()
    }, 900)
    voiceReconnectTimersRef.current.set(peerId, timer)
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
      roleMode,
      ...extra,
    })
  }

  function migrationSuccessor(list = playersRef.current) {
    return list.find(p => !p.isHost && p.connected !== false) || null
  }

  function buildHostBackupState() {
    return {
      roomCode,
      registryToken: registryTokenRef.current,
      sessionRejoinToken: sessionRejoinTokenRef.current,
      hostClientKey: playersRef.current.find(p => p.isHost)?.clientKey || clientKeyRef.current,
      players: playersRef.current,
      spectators: spectatorsRef.current,
      roomName,
      accessMode,
      accessCode,
      maxPlayers,
      maxSpectators,
      roles,
      roleMode,
      narratorOn,
      lang,
      screen: screenRef.current,
      phase: phaseRef.current,
      round: roundRef.current,
      phaseEndsAt: phaseEndsAtRef.current,
      gameStartsAt: gameStartsAtRef.current,
      roster: gameRosterRef.current,
      privateRoles: Array.from(privateRolesRef.current.entries()),
      playerVotes: playerVotesRef.current,
      killerVotes: killerVotesRef.current,
      doctorProtected: doctorProtectedRef.current,
      voteScores,
      dayMessages: dayMessagesRef.current,
      spectatorMessages: spectatorMessagesRef.current,
      kamikazeUsed: Array.from(kamikazeUsedRef.current),
      nightResolvedTarget,
      nightSaved,
      gameWinner,
      gameMvp,
      matchId: matchIdRef.current,
    }
  }

  function sendHostBackupState() {
    if (!isHostRef.current) return
    const successor = migrationSuccessor()
    if (!successor?.id) return
    const conn = guestConnsRef.current.get(successor.id)
    if (conn?.open) conn.send({ type: 'host-backup-state', snapshot: buildHostBackupState() })
  }

  function restoreMigratedAuthority(snapshot, newHostPeerId) {
    const selfKey = clientKeyRef.current
    const oldSelfId = snapshot.players?.find(p => p.clientKey === selfKey)?.id
    const oldHostKey = snapshot.hostClientKey

    const nextPlayers = (snapshot.players || []).map(p => {
      if (p.clientKey === selfKey) return { ...p, id: newHostPeerId, isHost: true, connected: true }
      if (p.clientKey === oldHostKey) return { ...p, isHost: false, connected: false }
      return { ...p, isHost: false }
    })
    playersRef.current = nextPlayers
    setPlayers(nextPlayers)

    const nextRoster = (snapshot.roster || []).map(p => {
      if (p.clientKey === selfKey) return { ...p, id: newHostPeerId, connected: true }
      if (p.clientKey === oldHostKey) return { ...p, connected: false }
      return p
    })
    gameRosterRef.current = nextRoster
    setGameRoster(nextRoster)

    privateRolesRef.current = new Map(snapshot.privateRoles || [])
    const ownRole = privateRolesRef.current.get(selfKey) || myRoleRef.current
    setMyRole(ownRole || null)
    myRoleRef.current = ownRole || null

    playerVotesRef.current = transferMapKey(snapshot.playerVotes || {}, oldSelfId, newHostPeerId)
    setPlayerVotes(playerVotesRef.current)
    killerVotesRef.current = transferMapKey(snapshot.killerVotes || {}, oldSelfId, newHostPeerId)
    setKillerVotes(killerVotesRef.current)
    doctorProtectedRef.current = snapshot.doctorProtected || ''
    setDoctorProtected(snapshot.doctorProtected || '')
    setVoteScores(snapshot.voteScores || {})

    const used = new Set(snapshot.kamikazeUsed || [])
    if (oldSelfId && used.has(oldSelfId)) {
      used.delete(oldSelfId)
      used.add(newHostPeerId)
    }
    kamikazeUsedRef.current = used
    setKamikazeUsed(used.has(newHostPeerId))

    setDayMessages(snapshot.dayMessages || [])
    setSpectatorMessages(snapshot.spectatorMessages || [])
    setNightResolvedTarget(snapshot.nightResolvedTarget || '')
    setNightSaved(!!snapshot.nightSaved)
    setGameWinner(snapshot.gameWinner || '')
    setGameMvp(snapshot.gameMvp || '')
    matchIdRef.current = String(snapshot.matchId || matchIdRef.current || '')
    setRoomName(snapshot.roomName ?? roomName)
    setAccessMode(snapshot.accessMode ?? accessMode)
    setAccessCode(snapshot.accessCode ?? accessCode)
    setMaxPlayers(snapshot.maxPlayers ?? maxPlayers)
    setMaxSpectators(snapshot.maxSpectators ?? maxSpectators)
    setRoles(snapshot.roles || roles)
    setRoleMode(snapshot.roleMode === 'custom' ? 'custom' : 'auto')
    setNarratorOn(snapshot.narratorOn !== false)
    setLang(snapshot.lang || lang)
    registryTokenRef.current = snapshot.registryToken || registryTokenRef.current
    sessionRejoinTokenRef.current = snapshot.sessionRejoinToken || sessionRejoinTokenRef.current

    const nextScreen = snapshot.screen || 'lobby'
    setScreen(nextScreen)
    screenRef.current = nextScreen
    setPhase(snapshot.phase || 'night')
    phaseRef.current = snapshot.phase || 'night'
    setRound(Number(snapshot.round || 1))
    roundRef.current = Number(snapshot.round || 1)
    setPhaseEndsAt(Number(snapshot.phaseEndsAt || 0))
    phaseEndsAtRef.current = Number(snapshot.phaseEndsAt || 0)
    setGameStartsAt(Number(snapshot.gameStartsAt || 0))
    gameStartsAtRef.current = Number(snapshot.gameStartsAt || 0)
    const migratedDead = !!nextRoster.find(p => p.clientKey === selfKey && !p.alive)
    setIsDead(migratedDead)
    isDeadRef.current = migratedDead
    if (migratedDead) setSpectatorRoleRoster(observerRoster(nextRoster))

    if (oldHostKey && oldHostKey !== selfKey) {
      const oldTimer = reconnectGraceTimersRef.current.get(oldHostKey)
      if (oldTimer) clearTimeout(oldTimer)
      const timer = setTimeout(() => {
        reconnectGraceTimersRef.current.delete(oldHostKey)
        const awayPlayer = playersRef.current.find(p => p.clientKey === oldHostKey && p.connected === false)
        if (!awayPlayer) return

        if (screenRef.current === 'role' || screenRef.current === 'game') {
          abortMatchToLobby(awayPlayer.id)
          return
        }

        const next = playersRef.current.filter(p => p.clientKey !== oldHostKey)
        playersRef.current = next
        setPlayers(next)
        broadcastState(next, spectatorsRef.current)
      }, 20000)
      reconnectGraceTimersRef.current.set(oldHostKey, timer)
    }
  }

  function promoteToHost(code, snapshot) {
    if (!code || !snapshot || isHostRef.current) return
    hostMigrationRef.current = true
    reconnectingRef.current = false
    setConnectionState('connecting')
    setConnectionError(lang === 'el' ? 'Ο host αποσυνδέθηκε. Αναλαμβάνεις το δωμάτιο...' : 'Host disconnected. You are taking over the room...')

    try { hostConnRef.current?.close?.() } catch {}
    hostConnRef.current = null
    try { peerRef.current?.destroy?.() } catch {}

    let attempts = 0
    const openHost = () => {
      attempts += 1
      const peer = makePeer(roomPeerId(code))
      if (!peer) {
        if (attempts < 12) setTimeout(openHost, 400)
        return
      }
      peerRef.current = peer
      let opened = false

      peer.on('open', id => {
        opened = true
        setIsHost(true)
        isHostRef.current = true
        setRoomCode(code)
        reconnectRoomRef.current = code
        saveReconnectSession(code)
        guestConnsRef.current.clear()
        restoreMigratedAuthority(snapshot, id)
        peer.on('connection', conn => setupHostConnectionRef.current?.(conn))
        setConnectionState('connected')
        setConnectionError(lang === 'el' ? 'Είσαι ο νέος host. Το παιχνίδι συνεχίζεται.' : 'You are the new host. The game continues.')
        hostMigrationRef.current = false

        writeRoomRegistry({
          room_code: code,
          room_name: (snapshot.roomName || roomName || `${name.trim()}'s Room`).slice(0,40),
          host_name: name.trim().slice(0,18),
          language: snapshot.lang || lang,
          access_mode: snapshot.accessMode || 'open',
          player_count: (snapshot.players || []).length,
          max_players: snapshot.maxPlayers ?? maxPlayers,
          spectator_count: (snapshot.spectators || []).length,
          max_spectators: snapshot.maxSpectators ?? maxSpectators,
          narrator_enabled: snapshot.narratorOn !== false,
          started: snapshot.screen === 'role' || snapshot.screen === 'game',
        }, snapshot.registryToken || registryTokenRef.current, true).catch(() => {})

        if (snapshot.screen === 'role') {
          clearScheduledGameTimers()
          const delay = Math.max(0, Number(snapshot.gameStartsAt || Date.now()) - Date.now())
          scheduledGameRef.current = setTimeout(() => {
            if (!isHostRef.current || screenRef.current !== 'role') return
            const actualStartsAt = Date.now()
            const firstNightEndsAt = actualStartsAt + 15000
            setScreen('game')
            screenRef.current = 'game'
            applyPhaseSchedule('night', 1, actualStartsAt, firstNightEndsAt)
            broadcast({ type: 'game-begin', phase: 'night', round: 1, startsAt: actualStartsAt, endsAt: firstNightEndsAt })
          }, delay)
        }
      })

      peer.on('error', err => {
        try { peer.destroy?.() } catch {}
        if (!opened && err?.type === 'unavailable-id' && attempts < 12) {
          setTimeout(openHost, 500)
          return
        }
        if (!opened) {
          hostMigrationRef.current = false
          setConnectionState('error')
          setConnectionError(t('lostHost'))
        }
      })
    }

    setTimeout(openHost, 350)
  }

  function handleHostLoss(code) {
    if (hostMigrationRef.current || isHostRef.current) return
    const successor = migrationSuccessor()
    const snapshot = hostBackupRef.current
    closeAllVoice()

    if (successor?.clientKey === clientKeyRef.current && snapshot?.roomCode === code) {
      promoteToHost(code, snapshot)
      return
    }

    hostMigrationRef.current = true
    setConnectionState('connecting')
    setConnectionError(lang === 'el' ? 'Ο host αποσυνδέθηκε. Μεταφορά host...' : 'Host disconnected. Migrating host...')
    clearTimeout(hostMigrationTimerRef.current)
    hostMigrationTimerRef.current = setTimeout(() => {
      hostMigrationRef.current = false
      attemptGuestReconnect(code)
    }, 1400)
  }

  function saveReconnectSession(code = reconnectRoomRef.current) {
    if (typeof window === 'undefined' || !code || !clientKeyRef.current) return
    localStorage.setItem('palermo-reconnect-v1', JSON.stringify({
      roomCode: String(code).toUpperCase(),
      clientKey: clientKeyRef.current,
      name: name.trim(),
      mode: joinMode,
      savedAt: Date.now(),
    }))
  }

  function clearReconnectSession() {
    if (typeof window !== 'undefined') localStorage.removeItem('palermo-reconnect-v1')
    reconnectRoomRef.current = ''
    reconnectingRef.current = false
  }

  function transferMapKey(map, oldId, newId) {
    if (!map || !oldId || !newId || oldId === newId || !(oldId in map)) return map
    const next = { ...map, [newId]: map[oldId] }
    delete next[oldId]
    return next
  }

  function reconnectGuest(conn, data) {
    const clientKey = String(data.clientKey || '')
    const matchRunning = screenRef.current === 'role' || screenRef.current === 'game'
    const existingRoster = gameRosterRef.current.find(p => p.clientKey === clientKey)
    const existingPlayer = playersRef.current.find(p => p.clientKey === clientKey)
    const existingSpectator = spectatorsRef.current.find(p => p.clientKey === clientKey)
    const existing = existingRoster || existingPlayer || existingSpectator
    if (!clientKey || !existing) {
      conn.send({ type: 'join-error', message: t('joinFail') })
      return
    }

    const oldId = existing.id
    const timer = reconnectGraceTimersRef.current.get(clientKey)
    if (timer) clearTimeout(timer)
    reconnectGraceTimersRef.current.delete(clientKey)

    guestConnsRef.current.delete(oldId)
    guestConnsRef.current.set(conn.peer, conn)

    if (!matchRunning) {
      if (existingPlayer) {
        const nextPlayers = playersRef.current.map(p =>
          p.clientKey === clientKey ? { ...p, id: conn.peer, connected: true } : p
        )
        playersRef.current = nextPlayers
        setPlayers(nextPlayers)
        conn.send({
          type: 'reconnect-approved',
          screen: 'lobby',
          players: nextPlayers,
          spectators: spectatorsRef.current,
          roster: [],
        })
        setTimeout(() => broadcastState(nextPlayers, spectatorsRef.current), 0)
        return
      }
      if (existingSpectator) {
        const nextSpectators = spectatorsRef.current.map(p =>
          p.clientKey === clientKey ? { ...p, id: conn.peer, connected: true } : p
        )
        spectatorsRef.current = nextSpectators
        setSpectators(nextSpectators)
        conn.send({
          type: 'reconnect-approved',
          screen: 'lobby',
          players: playersRef.current,
          spectators: nextSpectators,
          roster: [],
        })
        setTimeout(() => broadcastState(playersRef.current, nextSpectators), 0)
        return
      }
    }

    const nextRoster = gameRosterRef.current.map(p =>
      p.clientKey === clientKey ? { ...p, id: conn.peer, connected: true } : p
    )
    gameRosterRef.current = nextRoster
    setGameRoster(nextRoster)

    setPlayers(current => {
      const next = current.map(p =>
        p.clientKey === clientKey ? { ...p, id: conn.peer, connected: true } : p
      )
      playersRef.current = next
      return next
    })
    if (existingSpectator) {
      const nextSpectators = spectatorsRef.current.map(p =>
        p.clientKey === clientKey ? { ...p, id: conn.peer, connected: true } : p
      )
      spectatorsRef.current = nextSpectators
      setSpectators(nextSpectators)
    }

    playerVotesRef.current = transferMapKey(playerVotesRef.current, oldId, conn.peer)
    setPlayerVotes(playerVotesRef.current)
    killerVotesRef.current = transferMapKey(killerVotesRef.current, oldId, conn.peer)
    setKillerVotes(killerVotesRef.current)
    if (kamikazeUsedRef.current.has(oldId)) {
      kamikazeUsedRef.current.delete(oldId)
      kamikazeUsedRef.current.add(conn.peer)
    }

    const role = privateRolesRef.current.get(clientKey) || null
    conn.send({
      type: 'reconnect-approved',
      role,
      screen: screenRef.current,
      phase: phaseRef.current,
      round: roundRef.current,
      phaseEndsAt: phaseEndsAtRef.current,
      gameStartsAt: gameStartsAtRef.current,
      roster: publicRoster(nextRoster),
      players: playersRef.current,
      spectators: spectatorsRef.current,
      maxPlayers,
      maxSpectators,
      roles,
      roleMode,
      isDead: existingRoster ? !existingRoster.alive : false,
      observerRoster: (existingSpectator || (existingRoster && !existingRoster.alive))
        ? observerRoster(nextRoster)
        : [],
      dayMessages: dayMessagesRef.current,
      spectatorMessages: spectatorMessagesRef.current,
      voteLocked: !!playerVotesRef.current[conn.peer],
      voteTarget: playerVotesRef.current[conn.peer] || '',
      matchId: matchIdRef.current,
    })
    broadcast({ type: 'game-state', roster: publicRoster(nextRoster) })
    setTimeout(() => broadcastState(playersRef.current, spectatorsRef.current), 0)
  }

  function admitGuest(conn, data) {
    const cleanName = normalizePlayerName(data.name) || 'Player'
    const incomingKey = String(data.clientKey || conn.peer)
    const duplicateName = [...playersRef.current, ...spectatorsRef.current].some(person =>
      person.clientKey !== incomingKey &&
      normalizePlayerName(person.name).toLocaleLowerCase() === cleanName.toLocaleLowerCase()
    )
    if (duplicateName) {
      conn.send({ type: 'join-error', message: t('duplicateName') })
      return
    }

    const matchRunning = screenRef.current === 'role' || screenRef.current === 'game'
    if (matchRunning && data.mode !== 'spectator') {
      conn.send({
        type: 'join-error',
        message: lang === 'el'
          ? 'Το παιχνίδι έχει ήδη ξεκινήσει. Μπορείς να μπεις ως θεατής.'
          : 'The match has already started. You can join as a spectator.',
      })
      return
    }

    const entry = {
      id: conn.peer,
      name: cleanName,
      avatarUrl: String(data.avatarUrl || ''),
      clientKey: String(data.clientKey || conn.peer),
      connected: true,
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
        spectatorsRef.current = next
        conn.send({ type: 'join-approved' })
        if (matchRunning) {
          setTimeout(() => {
            conn.send({
              type: 'observer-join-game',
              roster: publicRoster(gameRosterRef.current),
              observerRoster: observerRoster(gameRosterRef.current),
              phase: phaseRef.current,
              round: roundRef.current,
              phaseEndsAt: phaseEndsAtRef.current,
              gameStartsAt: gameStartsAtRef.current,
            })
          }, 40)
        }
        setTimeout(() => broadcastState(playersRef.current, next), 0)
        return next
      })
    } else {
      setPlayers(current => {
        if (current.length >= maxPlayers) {
          conn.send({ type: 'join-error', message: t('playerFull') })
          return current
        }
        const next = [...current.filter(p => p.id !== conn.peer), entry]
        playersRef.current = next
        conn.send({ type: 'join-approved' })
        setTimeout(() => broadcastState(next, spectatorsRef.current), 0)
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
    myRoleRef.current = null
    privateRolesRef.current.clear()
    matchResultRecordedRef.current = false
    setPhase('night')
    phaseRef.current = 'night'
    setRound(1)
    setVote('')
    setVoteLocked(false)
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
    setDayText('')
    setSpectatorMessages([])
    setSpectatorRoleRoster([])
    setGameWinner('')
    setGameMvp('')
    matchIdRef.current = ''
    clearScheduledGameTimers()
    if (scheduledPhaseRef.current) clearTimeout(scheduledPhaseRef.current)
    scheduledPhaseRef.current = null
    setCountdown(null)
    setGameStartsAt(0)
    setPhaseEndsAt(0)
    setDiscussion(120)
    setVoteTimer(30)
    setReady(false)
    setGameRoster([])
    gameRosterRef.current = []
    privateRolesRef.current.clear()
    setTimeout(updateVoiceGate, 0)
  }

  function abortMatchToLobby(leaverPeerId = '') {
    if (!isHostRef.current) return
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
          roleMode,
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

      if (data.type === 'clock-sync-ping') {
        conn.send({ type: 'clock-sync-pong', clientSentAt: Number(data.clientSentAt || 0), hostNow: Date.now() })
        return
      }

      if (data.type === 'reconnect') {
        reconnectGuest(conn, data)
        return
      }

      if (data.type === 'session-rejoin') {
        if (!sessionRejoinTokenRef.current || data.token !== sessionRejoinTokenRef.current) {
          conn.send({ type: 'join-error', message: t('joinFail') })
          return
        }
        admitGuest(conn, { name: data.name, avatarUrl: data.avatarUrl, clientKey: data.clientKey, mode: data.mode || 'player' })
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
              avatarUrl: String(data.avatarUrl || ''),
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
        const target = String(data.target || '')
        if (registerDayVote(conn.peer, target)) {
          conn.send({ type: 'vote-locked', target })
        }
      }

      if (data.type === 'observer-state-request') {
        const deadPlayer = gameRosterRef.current.some(p => p.id === conn.peer && !p.alive)
        const spectator = spectatorsRef.current.some(p => p.id === conn.peer)
        if (deadPlayer || spectator) {
          conn.send({ type: 'observer-state', roster: observerRoster(gameRosterRef.current) })
        }
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
        const active = gameRosterRef.current.find(p => p.id === conn.peer)
        const reconnectKey = active?.clientKey || conn.peer
        const nextRoster = gameRosterRef.current.map(p =>
          p.id === conn.peer ? { ...p, connected: false } : p
        )
        gameRosterRef.current = nextRoster
        setGameRoster(nextRoster)
        setPlayers(current => {
          const next = current.map(p =>
            p.id === conn.peer ? { ...p, connected: false } : p
          )
          playersRef.current = next
          return next
        })
        broadcast({ type: 'game-state', roster: publicRoster(nextRoster) })

        const previousTimer = reconnectGraceTimersRef.current.get(reconnectKey)
        if (previousTimer) clearTimeout(previousTimer)
        const timer = setTimeout(() => {
          reconnectGraceTimersRef.current.delete(reconnectKey)
          const stillAway = gameRosterRef.current.find(p => p.clientKey === reconnectKey && p.connected === false)
          if (stillAway) abortMatchToLobby(stillAway.id)
        }, 20000)
        reconnectGraceTimersRef.current.set(reconnectKey, timer)
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
    const cleanName = normalizePlayerName(name)
    if (!cleanName) return
    if (cleanName !== name) setName(cleanName)
    const Peer = getPeer()
    if (!Peer) {
      setConnectionError(t('multiplayerLoading'))
      return
    }

    const code = randomCode()
    registryTokenRef.current = `${crypto.randomUUID()}${crypto.randomUUID()}`
    setRoomCode(code)
    setIsHost(true)
    isHostRef.current = true
    setConnectionState('connecting')
    setConnectionError('')

    const peer = makePeer(roomPeerId(code))
    peerRef.current = peer

    peer.on('open', id => {
      const hostPlayer = { id, name: cleanName, avatarUrl, clientKey: clientKeyRef.current || id, connected: true, ready: false, isHost: true }
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
      playersRef.current = [hostPlayer]
      reconnectRoomRef.current = code
      saveReconnectSession(code)
      setSpectators([])
      setIsHost(true)
      isHostRef.current = true
      setConnectionState('connected')
      setScreen('lobby')
    })

    peer.on('connection', conn => setupHostConnectionRef.current?.(conn))
    peer.on('error', err => {
      setConnectionState('error')
      setConnectionError(err?.type === 'unavailable-id' ? t('roomCollision') : t('roomOpenFail'))
    })
  }

  function handleGuestData(data) {
        if (!data || typeof data !== 'object') return
        if (data.type === 'host-backup-state') {
          hostBackupRef.current = data.snapshot || null
          return
        }
        if (data.type === 'clock-sync-pong') {
          const receivedAt = Date.now()
          const sentAt = Number(data.clientSentAt || receivedAt)
          const midpoint = sentAt + (receivedAt - sentAt) / 2
          const sample = Number(data.hostNow || receivedAt) - midpoint
          clockOffsetRef.current = clockOffsetRef.current
            ? (clockOffsetRef.current * 0.7 + sample * 0.3)
            : sample
          return
        }
        if (data.type === 'join-pending') {
          setJoinPending(true)
          setConnectionState('waiting')
        }
        if (data.type === 'join-approved') {
          setJoinPending(false)
          setConnectionState('connected')
          saveReconnectSession()
          setScreen('lobby')
        }
        if (data.type === 'reconnect-approved') {
          reconnectingRef.current = false
          setJoinPending(false)
          setConnectionState('connected')
          setConnectionError('')
          if (Array.isArray(data.players)) {
            playersRef.current = data.players
            setPlayers(data.players)
          }
          if (Array.isArray(data.spectators)) {
            spectatorsRef.current = data.spectators
            setSpectators(data.spectators)
          }
          if (Array.isArray(data.roster)) {
            gameRosterRef.current = data.roster
            setGameRoster(data.roster)
          }
          setMyRole(data.role || null)
          setIsDead(!!data.isDead)
          isDeadRef.current = !!data.isDead
          setSpectatorRoleRoster(Array.isArray(data.observerRoster) ? data.observerRoster : [])
          setDayMessages(Array.isArray(data.dayMessages) ? data.dayMessages : [])
          setSpectatorMessages(Array.isArray(data.spectatorMessages) ? data.spectatorMessages : [])
          setVoteLocked(!!data.voteLocked)
          setVote(String(data.voteTarget || ''))
          if (data.matchId) matchIdRef.current = String(data.matchId)
          setMaxPlayers(data.maxPlayers ?? maxPlayers)
          setMaxSpectators(data.maxSpectators ?? maxSpectators)
          if (Array.isArray(data.roles)) setRoles(data.roles)
          setRoleMode(data.roleMode === 'custom' ? 'custom' : 'auto')
          setGameStartsAt(Number(data.gameStartsAt || 0))
          if (data.screen === 'lobby') {
            setReady(!!(data.players || []).find(p => p.clientKey === clientKeyRef.current)?.ready)
            setScreen('lobby')
            screenRef.current = 'lobby'
          } else if (data.screen === 'role' && Number(data.gameStartsAt || 0) > syncedHostNow()) {
            setScreen('role')
            screenRef.current = 'role'
            setCountdown(Math.max(0, Math.ceil((Number(data.gameStartsAt) - syncedHostNow()) / 1000)))
          } else {
            setScreen('game')
            screenRef.current = 'game'
            applyPhaseSchedule(
              data.phase || 'night',
              Number(data.round || 1),
              syncedHostNow(),
              Number(data.phaseEndsAt || 0)
            )
          }
          saveReconnectSession()
        }
        if (data.type === 'room-state') {
          setPlayers(data.players || [])
          setSpectators(data.spectators || [])
          setMaxPlayers(data.maxPlayers ?? 10)
          setMaxSpectators(data.maxSpectators ?? 4)
          setRoles(data.roles || DEFAULT_ROLES)
          setRoleMode(data.roleMode === 'custom' ? 'custom' : 'auto')
        }
        if (data.type === 'join-error') {
          reconnectingRef.current = false
          setJoinPending(false)
          setConnectionError(data.message || t('joinFail'))
          setConnectionState('error')
        }
        if (data.type === 'countdown') setCountdown(data.value)
        if (data.type === 'game-start') {
          matchIdRef.current = String(data.matchId || '')
          const startsAt = Number(data.gameStartsAt || (syncedHostNow() + 5000))
          setMyRole(data.role)
          setGameStartsAt(startsAt)
          setCountdown(Math.max(0, Math.ceil((startsAt - syncedHostNow()) / 1000)))
          clearScheduledGameTimers()
          setScreen('role')
          screenRef.current = 'role'
        }
        if (data.type === 'game-begin') {
          setCountdown(null)
          setScreen('game')
          screenRef.current = 'game'
          applyPhaseSchedule(
            data.phase || 'night',
            data.round || 1,
            Number(data.startsAt || syncedHostNow()),
            Number(data.endsAt || 0)
          )
        }
        if (data.type === 'night-result') {
          setNightResolvedTarget(data.target || '')
          setNightSaved(!!data.saved)
          if (data.saved) {
            showResultBanner('safe', lang === 'el' ? 'ΚΑΝΕΙΣ ΔΕΝ ΠΕΘΑΝΕ' : 'NO ONE DIED', lang === 'el' ? 'Ο Γιατρός έσωσε τον στόχο.' : 'The Doctor saved the target.')
          } else if (data.target) {
            showResultBanner('death', data.target, lang === 'el' ? 'ΔΕΝ ΕΠΕΖΗΣΕ ΤΗ ΝΥΧΤΑ' : 'DID NOT SURVIVE THE NIGHT')
          } else {
            showResultBanner('safe', lang === 'el' ? 'Η ΝΥΧΤΑ ΗΤΑΝ ΗΣΥΧΗ' : 'A QUIET NIGHT', lang === 'el' ? 'Κανείς δεν πέθανε.' : 'Nobody died.')
          }
        }
        if (data.type === 'game-state') {
          gameRosterRef.current = data.roster || []
          setGameRoster(data.roster || [])
        }
        if (data.type === 'observer-state') {
          setSpectatorRoleRoster(Array.isArray(data.roster) ? data.roster : [])
        }
        if (data.type === 'observer-join-game') {
          const publicState = Array.isArray(data.roster) ? data.roster : []
          gameRosterRef.current = publicState
          setGameRoster(publicState)
          setSpectatorRoleRoster(Array.isArray(data.observerRoster) ? data.observerRoster : [])
          setCountdown(null)
          setScreen('game')
          screenRef.current = 'game'
          applyPhaseSchedule(
            data.phase || 'night',
            Number(data.round || 1),
            syncedHostNow(),
            Number(data.phaseEndsAt || 0)
          )
        }
        if (data.type === 'eliminated') {
          setIsDead(true)
          isDeadRef.current = true
          hostConnRef.current?.send({ type: 'observer-state-request' })
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
        if (data.type === 'vote-locked') {
          setVote(String(data.target || vote))
          setVoteLocked(true)
        }
        if (data.type === 'vote-result') {
          if (data.name && data.roleLabel) {
            showResultBanner('eliminated', data.name, `${lang === 'el' ? 'ΡΟΛΟΣ' : 'ROLE'}: ${data.roleLabel}`)
            speak(lang === 'el'
              ? `Η ψηφοφορία ολοκληρώθηκε. Ο παίκτης ${data.name} αποκλείστηκε. Ο ρόλος του ήταν ${data.roleLabel}.`
              : `The votes are in. ${data.name} has been eliminated. Their role was ${data.roleLabel}.`,
              { interrupt: true, rate: 0.87, pitch: 0.9 })
          } else {
            showResultBanner('skip', lang === 'el' ? 'ΚΑΝΕΙΣ ΔΕΝ ΑΠΟΚΛΕΙΣΤΗΚΕ' : 'NO ELIMINATION', lang === 'el' ? 'Η ψηφοφορία δεν έβγαλε νικητή.' : 'The vote ended without a clear target.')
            speak(lang === 'el' ? 'Η ψηφοφορία έληξε χωρίς αποκλεισμό. Κανείς δεν αποχωρεί.' : 'The vote ends without an elimination. Nobody leaves the game.', { interrupt: true, rate: 0.88, pitch: 0.92 })
          }
        }
        if (data.type === 'game-over') {
          setGameWinner(data.winner || '')
          setGameMvp(data.mvp || '')
          if (Array.isArray(data.roster)) {
            gameRosterRef.current = data.roster
            setGameRoster(data.roster)
          }
          recordMatchResult(data.winner || '', data.mvp || '')
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
          setRoleMode(data.roleMode === 'custom' ? 'custom' : roleMode)
          playersRef.current = (data.players || []).map(p => ({ ...p, ready: false }))
          spectatorsRef.current = data.spectators || []
          setConnectionError(t('playerLeftAbort'))
          setConnectionState('connected')
          setScreen('lobby')
          screenRef.current = 'lobby'
        }
        if (data.type === 'phase-change') {
          applyPhaseSchedule(
            data.phase || 'night',
            data.round || 1,
            Number(data.startsAt || syncedHostNow()),
            Number(data.endsAt || 0)
          )
        }
      
  }

  function attemptGuestReconnect(code) {
    if (!code || reconnectingRef.current) return
    const Peer = getPeer()
    if (!Peer) {
      setTimeout(() => attemptGuestReconnect(code), 400)
      return
    }

    reconnectingRef.current = true
    const generation = reconnectGenerationRef.current + 1
    reconnectGenerationRef.current = generation
    const normalizedCode = String(code).toUpperCase()
    const deadline = Date.now() + 20000

    reconnectRoomRef.current = normalizedCode
    setConnectionState('connecting')
    setConnectionError(lang === 'el' ? 'Επανασύνδεση...' : 'Reconnecting...')

    const isCurrent = () => reconnectGenerationRef.current === generation
    const finishFailure = () => {
      if (!isCurrent()) return
      reconnectingRef.current = false
      reconnectGenerationRef.current += 1
      clearReconnectSession()
      setConnectionState('error')
      setConnectionError(t('lostHost'))
      setRoomCode('')
      setPlayers([])
      playersRef.current = []
      setSpectators([])
      spectatorsRef.current = []
      setIsHost(false)
      isHostRef.current = false
      setScreen('home')
      screenRef.current = 'home'
    }

    const retry = () => {
      if (!isCurrent()) return
      if (Date.now() >= deadline) {
        finishFailure()
        return
      }
      setTimeout(connectOnce, 650)
    }

    const connectOnce = () => {
      if (!isCurrent()) return
      if (Date.now() >= deadline) {
        finishFailure()
        return
      }

      try { hostConnRef.current?.close?.() } catch {}
      try { peerRef.current?.destroy?.() } catch {}
      hostConnRef.current = null

      const peer = makePeer()
      if (!peer) {
        retry()
        return
      }
      peerRef.current = peer
      let attemptSettled = false
      let attemptTimer = null

      const failAttempt = () => {
        if (attemptSettled || !isCurrent()) return
        attemptSettled = true
        clearTimeout(attemptTimer)
        try { peer.destroy?.() } catch {}
        retry()
      }

      attemptTimer = setTimeout(failAttempt, 2800)

      peer.on('open', () => {
        if (!isCurrent() || attemptSettled) return
        const conn = peer.connect(roomPeerId(normalizedCode), { reliable: true })
        hostConnRef.current = conn

        conn.on('open', () => {
          if (!isCurrent() || attemptSettled) return
          conn.send({
            type: 'reconnect',
            clientKey: clientKeyRef.current,
            name: name.trim(),
            avatarUrl,
          })
        })

        conn.on('data', data => {
          if (!isCurrent()) return
          if (data?.type === 'reconnect-approved') {
            attemptSettled = true
            clearTimeout(attemptTimer)
            reconnectingRef.current = false
            reconnectGenerationRef.current += 1
            setConnectionState('connected')
            setConnectionError('')
          }
          if (data?.type === 'join-error') {
            failAttempt()
            return
          }
          handleGuestData(data)
        })

        conn.on('close', () => {
          if (reconnectingRef.current) failAttempt()
          else if (['lobby','role','game'].includes(screenRef.current)) handleHostLoss(normalizedCode)
        })
        conn.on('error', failAttempt)
      })

      peer.on('error', failAttempt)
    }

    connectOnce()
  }

  function joinRoom() {
    const cleanName = normalizePlayerName(name)
    if (!cleanName || !joinCode.trim()) return
    if (cleanName !== name) setName(cleanName)
    const Peer = getPeer()
    if (!Peer) {
      setConnectionError('Multiplayer is still loading. Try again in a second.')
      return
    }

    const code = joinCode.trim().toUpperCase()
    if (!/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{5}$/.test(code)) {
      setConnectionState('error')
      setConnectionError(t('invalidRoomCode'))
      return
    }
    reconnectRoomRef.current = code
    setRoomCode(code)
    setIsHost(false)
    isHostRef.current = false
    setConnectionState('connecting')
    setConnectionError('')

    const peer = makePeer()
    peerRef.current = peer

    peer.on('open', () => {
      const conn = peer.connect(roomPeerId(code), { reliable: true })
      hostConnRef.current = conn

      conn.on('open', () => {
        conn.send({ type: 'join', name: cleanName, avatarUrl, clientKey: clientKeyRef.current, mode: joinMode, accessCode: joinAccessCode })
        setJoinPending(true)
        setConnectionState('waiting')
      })

      conn.on('data', handleGuestData)
      conn.on('close', () => {
        if (['lobby','role','game'].includes(screenRef.current)) {
          handleHostLoss(reconnectRoomRef.current || code)
          return
        }
        setConnectionState('error')
        setConnectionError(t('lostHost'))
      })

      conn.on('error', () => {
        setJoinPending(false)
        setConnectionState('error')
        setConnectionError(t('connectFail'))
      })
    })
    peer.on('error', () => {
      setJoinPending(false)
      setConnectionState('error')
      setConnectionError(t('connectFail'))
    })
  }

  async function shareRoomInvite() {
    if (!roomCode) return
    const inviteUrl = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomCode)}`
      : roomCode
    const title = lang === 'el' ? 'Palermo Online — Πρόσκληση' : 'Palermo Online — Invite'
    const text = lang === 'el'
      ? `Μπες στο δωμάτιό μου στο Palermo. Κωδικός: ${roomCode}`
      : `Join my Palermo room. Code: ${roomCode}`

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url: inviteUrl })
        setShareStatus('shared')
      } else {
        await navigator.clipboard?.writeText(`${text}\n${inviteUrl}`)
        setShareStatus('copied')
      }
    } catch (error) {
      if (error?.name === 'AbortError') return
      try {
        await navigator.clipboard?.writeText(`${text}\n${inviteUrl}`)
        setShareStatus('copied')
      } catch {}
    }
    setTimeout(() => setShareStatus(''), 2200)
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

  function resetLobbyReadyForSettings(nextRoles, nextMode = roleMode) {
    setReady(false)
    setPlayers(current => {
      const nextPlayers = current.map(player => ({ ...player, ready: false }))
      playersRef.current = nextPlayers
      setTimeout(() => broadcast({
        type: 'room-state',
        players: nextPlayers,
        spectators: spectatorsRef.current,
        maxPlayers,
        maxSpectators,
        roles: nextRoles,
        roleMode: nextMode,
      }), 0)
      return nextPlayers
    })
  }

  function changeRoleMode(nextMode) {
    if (!isHost || !['auto','custom'].includes(nextMode) || nextMode === roleMode) return
    const nextRoles = nextMode === 'auto' ? automaticRolesForPlayers(playersRef.current.length) : roles
    setRoleMode(nextMode)
    setRoles(nextRoles)
    resetLobbyReadyForSettings(nextRoles, nextMode)
  }

  function changeRole(id, delta) {
    if (!isHost || roleMode !== 'custom') return

    const maximums = {
      visibleKiller: 1,
      hiddenKiller: 3,
      detective: 1,
      doctor: 1,
      lover: 2,
      kamikaze: 1,
      madness: 1,
    }

    setRoles(current => {
      const next = current.map(role => {
        if (role.id !== id) return role
        if (id === 'lover') {
          return { ...role, count: delta > 0 ? 2 : 0 }
        }
        const max = maximums[id] ?? 1
        return { ...role, count: Math.max(role.min, Math.min(max, role.count + delta)) }
      })
      resetLobbyReadyForSettings(next, 'custom')
      return next
    })
  }

  function changeMaxPlayers(value) {
    if (!isHost) return
    const next = Math.max(playersRef.current.length, 2, Math.min(16, Number(value) || 2))
    setMaxPlayers(next)
    setTimeout(() => broadcast({ type:'room-state', players: playersRef.current, spectators: spectatorsRef.current, maxPlayers: next, maxSpectators, roles, roleMode }), 0)
  }

  function changeMaxSpectators(value) {
    if (!isHost) return
    const next = Math.max(spectatorsRef.current.length, 0, Math.min(10, Number(value) || 0))
    setMaxSpectators(next)
    setTimeout(() => broadcast({ type:'room-state', players: playersRef.current, spectators: spectatorsRef.current, maxPlayers, maxSpectators: next, roles, roleMode }), 0)
  }

  function startGame() {
    const configuredRoleSlots = roles.reduce((sum, role) => sum + role.count, 0)
    const killerSlots = roles
      .filter(role => role.id === 'visibleKiller' || role.id === 'hiddenKiller')
      .reduce((sum, role) => sum + role.count, 0)
    const loverSlots = roles.find(role => role.id === 'lover')?.count || 0
    const setupValid = configuredRoleSlots <= players.length && killerSlots >= 1 && (loverSlots === 0 || loverSlots === 2)
    if (!isHost || players.length < 2 || !players.every(p => p.connected !== false && p.ready) || !setupValid) return

    let pool = roles.flatMap(role => Array(role.count).fill(role))
    while (pool.length < players.length) pool.push(citizen)
    pool = shuffle(pool).slice(0, players.length)

    const assigned = players.map((player, index) => ({
      player,
      role: pool[index] || citizen,
    }))
    const visibleKillerPlayer = assigned.find(entry => entry.role.id === 'visibleKiller')?.player
    const killerPlayers = assigned
      .filter(entry => entry.role.id === 'visibleKiller' || entry.role.id === 'hiddenKiller')
      .map(entry => entry.player)
    const loverPlayers = assigned.filter(entry => entry.role.id === 'lover').map(entry => entry.player)
    const roster = assigned.map(({ player, role }) => ({
      id: player.id,
      name: player.name,
      roleId: role.id,
      clientKey: player.clientKey || player.id,
      connected: true,
      alive: true,
    }))

    const matchId = crypto.randomUUID()
    matchIdRef.current = matchId
    const revealAt = Date.now()
    const startsAt = revealAt + 5000

    privateRolesRef.current.clear()
    setGameRoster(roster)
    gameRosterRef.current = roster
    setPlayerVotes({})
    setVoteScores({})
    setIsDead(false)
    setGameWinner('')
    setGameMvp('')
    matchResultRecordedRef.current = false
    setKamikazeUsed(false)
    kamikazeUsedRef.current = new Set()
    setDayMessages([])
    setDayText('')
    setGameStartsAt(startsAt)
    setPhaseEndsAt(0)
    broadcast({ type: 'game-state', roster: publicRoster(roster) })
    spectatorsRef.current.forEach(spectator => {
      guestConnsRef.current.get(spectator.id)?.send({
        type: 'observer-state',
        roster: observerRoster(roster),
      })
    })

    assigned.forEach(({ player, role }) => {
      let privateRole = role.id === 'detective' && visibleKillerPlayer
        ? { ...role, knownVisibleKiller: visibleKillerPlayer.name }
        : role

      if (role.id === 'visibleKiller' || role.id === 'hiddenKiller') {
        const teammates = killerPlayers.filter(p => p.id !== player.id).map(p => p.name)
        privateRole = { ...privateRole, killerTeammates: teammates }
      }
      if (role.id === 'lover' && loverPlayers.length >= 2) {
        const partner = loverPlayers.find(p => p.id !== player.id)
        if (partner) privateRole = { ...privateRole, loverPartner: partner.name }
      }

      privateRolesRef.current.set(player.clientKey || player.id, privateRole)

      const payload = {
        type: 'game-start',
        matchId,
        role: privateRole,
        revealAt,
        gameStartsAt: startsAt,
      }

      if (player.isHost) setMyRole(privateRole)
      else guestConnsRef.current.get(player.id)?.send(payload)
    })

    setCountdown(5)
    setScreen('role')
    screenRef.current = 'role'

    clearScheduledGameTimers()
    // Only the host owns the role-reveal transition. Clients wait for game-begin.
    scheduledGameRef.current = setTimeout(() => {
      setCountdown(null)
      const actualStartsAt = Date.now()
      const firstNightEndsAt = actualStartsAt + 15000
      setScreen('game')
      screenRef.current = 'game'
      applyPhaseSchedule('night', 1, actualStartsAt, firstNightEndsAt)
      broadcast({
        type: 'game-begin',
        phase: 'night',
        round: 1,
        startsAt: actualStartsAt,
        endsAt: firstNightEndsAt,
      })
    }, 5000)
  }

  async function requestMic() {
    setMicError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      })
      closeAllVoice()
      streamRef.current?.getTracks?.().forEach(track => track.stop())
      streamRef.current = stream
      mutedRef.current = false
      setMicState('granted')
      setMuted(false)
      setTimeout(() => {
        ensureVoiceCalls()
        announceVoiceReady()
        updateVoiceGate()
      }, 80)
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
    return roster.map(({ id, name, alive, connected = true }) => ({ id, name, alive, connected }))
  }

  function observerRoster(roster = gameRosterRef.current) {
    return roster.map(({ id, name, alive, connected = true, roleId }) => ({
      id,
      name,
      alive,
      connected,
      roleId,
    }))
  }

  function sendObserverState(roster = gameRosterRef.current) {
    if (!isHostRef.current) return
    const safeRoster = observerRoster(roster)
    const myId = peerRef.current?.id
    const hostPlayer = roster.find(p => p.id === myId)
    if (hostPlayer && !hostPlayer.alive) setSpectatorRoleRoster(safeRoster)

    guestConnsRef.current.forEach((conn, peerId) => {
      const deadPlayer = roster.some(p => p.id === peerId && !p.alive)
      const spectator = spectatorsRef.current.some(p => p.id === peerId)
      if (conn?.open && (deadPlayer || spectator)) {
        conn.send({ type: 'observer-state', roster: safeRoster })
      }
    })
  }

  function aliveRoster(roster = gameRosterRef.current) {
    return roster.filter(p => p.alive)
  }

  function finishMatch(winner, roster = gameRoster, scores = voteScores) {
    if (!isHostRef.current) return
    const scoreEntries = Object.entries(scores)
    const maxScore = scoreEntries.length ? Math.max(...scoreEntries.map(([, score]) => score)) : 0
    const mvpId = scoreEntries.find(([, score]) => score === maxScore && score > 0)?.[0]
    const mvp = roster.find(p => p.id === mvpId)?.name || ''
    setGameWinner(winner)
    setGameMvp(mvp)
    recordMatchResult(winner, mvp)
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
    if (!isHostRef.current || phaseRef.current !== 'day' || !targetName) return
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
    sendObserverState(nextRoster)
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
    if (!isHostRef.current || phaseRef.current !== 'vote' || !target) return false
    const rosterNow = gameRosterRef.current
    const voter = rosterNow.find(p => p.id === voterId)
    if (!voter?.alive) return false

    const next = { ...playerVotesRef.current, [voterId]: target }
    playerVotesRef.current = next
    setPlayerVotes(next)

    const aliveCount = rosterNow.filter(p => p.alive).length
    if (aliveCount > 0 && Object.keys(next).length >= aliveCount) {
      setTimeout(() => {
        if (phaseRef.current === 'vote') resolveDayVote(next)
      }, 250)
    }
    return true
  }

  function resolveDayVote(votesMap) {
    if (!isHostRef.current) return
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
        showResultBanner('eliminated', victim.name, `${lang === 'el' ? 'ΡΟΛΟΣ' : 'ROLE'}: ${roleLabel}`)
        speak(lang === 'el'
          ? `Η ψηφοφορία ολοκληρώθηκε. Ο παίκτης ${victim.name} αποκλείστηκε. Ο ρόλος του ήταν ${roleLabel}.`
          : `The votes are in. ${victim.name} has been eliminated. Their role was ${roleLabel}.`,
          { interrupt: true, rate: 0.87, pitch: 0.9 })
        broadcast({ type: 'vote-result', name: victim.name, roleLabel })
        let nextRoster = rosterNow.map(p => p.id === victim.id ? { ...p, alive: false } : p)
        const loverChain = applyLoverChain(nextRoster, victim)
        nextRoster = loverChain.roster
        setGameRoster(nextRoster)
        gameRosterRef.current = nextRoster
        broadcast({ type: 'game-state', roster: publicRoster(nextRoster) })
        sendObserverState(nextRoster)
        if (victim.id === peerRef.current?.id) setIsDead(true)
        else guestConnsRef.current.get(victim.id)?.send({ type: 'eliminated', reason: 'vote' })
        loverChain.chained.forEach(partner => {
          if (partner.id === peerRef.current?.id) setIsDead(true)
          else guestConnsRef.current.get(partner.id)?.send({ type: 'eliminated', reason: 'lover' })
        })
        if (checkWin(nextRoster, victim.roleId, nextScores)) return
      }
    } else {
      showResultBanner('skip', lang === 'el' ? 'ΚΑΝΕΙΣ ΔΕΝ ΑΠΟΚΛΕΙΣΤΗΚΕ' : 'NO ELIMINATION', lang === 'el' ? 'Η ψηφοφορία δεν έβγαλε νικητή.' : 'The vote ended without a clear target.')
      speak(lang === 'el' ? 'Η ψηφοφορία έληξε χωρίς αποκλεισμό. Κανείς δεν αποχωρεί.' : 'The vote ends without an elimination. Nobody leaves the game.', { interrupt: true, rate: 0.88, pitch: 0.92 })
      broadcast({ type: 'vote-result', name: '', roleLabel: '' })
    }

    const nextRound = roundRef.current + 1
    setPlayerVotes({})
    playerVotesRef.current = {}
    setVote('')
    setVoteLocked(false)
    hostSchedulePhase('night', nextRound, 15)
  }

  function resolveKillerVotes(currentKillerVotes = killerVotesRef.current, currentDoctorProtected = doctorProtectedRef.current) {
    if (!isHostRef.current || phaseRef.current !== 'night') return
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
    if (saved) {
      showResultBanner('safe', lang === 'el' ? 'ΚΑΝΕΙΣ ΔΕΝ ΠΕΘΑΝΕ' : 'NO ONE DIED', lang === 'el' ? 'Ο Γιατρός έσωσε τον στόχο.' : 'The Doctor saved the target.')
    } else if (resolvedTarget) {
      showResultBanner('death', resolvedTarget, lang === 'el' ? 'ΔΕΝ ΕΠΕΖΗΣΕ ΤΗ ΝΥΧΤΑ' : 'DID NOT SURVIVE THE NIGHT')
    } else {
      showResultBanner('safe', lang === 'el' ? 'Η ΝΥΧΤΑ ΗΤΑΝ ΗΣΥΧΗ' : 'A QUIET NIGHT', lang === 'el' ? 'Κανείς δεν πέθανε.' : 'Nobody died.')
    }
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
        sendObserverState(nextRoster)
        if (victim.id === peerRef.current?.id) setIsDead(true)
        else guestConnsRef.current.get(victim.id)?.send({ type: 'eliminated', reason: 'night' })
        loverChain.chained.forEach(partner => {
          if (partner.id === peerRef.current?.id) setIsDead(true)
          else guestConnsRef.current.get(partner.id)?.send({ type: 'eliminated', reason: 'lover' })
        })
        if (checkWin(nextRoster, '')) return
      }
    }

    hostSchedulePhase('day', roundRef.current, 120)
  }

  function nextPhase() {
    if (!isHostRef.current) return
    if (phaseRef.current === 'night') {
      resolveKillerVotes()
    } else {
      hostSchedulePhase('vote', roundRef.current, 30)
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
      roleMode,
      narratorOn,
      lang,
    }
  }

  function leaveToBrowser(notify = true) {
    const oldCode = roomCode
    reconnectGenerationRef.current += 1
    clearReconnectSession()
    hostBackupRef.current = null
    hostMigrationRef.current = false
    clearTimeout(hostMigrationTimerRef.current)
    reconnectGraceTimersRef.current.forEach(timer => clearTimeout(timer))
    reconnectGraceTimersRef.current.clear()
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
    isHostRef.current = false
    setPlayers([])
    playersRef.current = []
    setSpectators([])
    spectatorsRef.current = []
    setRoleMode('auto')
    setRoles(DEFAULT_ROLES)
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
    setSpectatorRoleRoster([])
    setGameWinner('')
    setGameMvp('')
    setConnectionState('idle')
    setConnectionError('')
    setSessionTransitioning(false)
    setScreen('home')
    screenRef.current = 'home'
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
    setRoleMode(settings.roleMode === 'custom' ? 'custom' : 'auto')
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
      const peer = makePeer(roomPeerId(newCode))
      peerRef.current = peer
        peer.on('open', id => {
        const hostPlayer = { id, name: name.trim().slice(0,18), avatarUrl, clientKey: clientKeyRef.current || id, connected: true, ready: false, isHost: true }
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
        playersRef.current = [hostPlayer]
        reconnectRoomRef.current = newCode
        saveReconnectSession(newCode)
        setConnectionState('connected')
        setSessionTransitioning(false)
        setScreen('lobby')
      })
      peer.on('connection', conn => setupHostConnectionRef.current?.(conn))
      peer.on('error', () => {
        setConnectionState('error')
        setConnectionError(t('roomOpenFail'))
      })
    } else {
      setIsHost(false)
      const peer = makePeer()
      peerRef.current = peer
        peer.on('open', () => {
        const conn = peer.connect(roomPeerId(newCode), { reliable: true })
        hostConnRef.current = conn
        conn.on('open', () => {
          reconnectRoomRef.current = newCode
          conn.send({
            type: 'session-rejoin',
            token: payload.rejoinToken,
            name: name.trim(),
            avatarUrl,
            clientKey: clientKeyRef.current,
            mode: joinMode,
          })
        })
        conn.on('data', data => {
          if (!data || typeof data !== 'object') return
          if (data.type === 'join-approved') {
            setConnectionState('connected')
            setSessionTransitioning(false)
            saveReconnectSession(newCode)
            setScreen('lobby')
          }
          if (data.type === 'room-state') {
            setPlayers(data.players || [])
            setSpectators(data.spectators || [])
            setMaxPlayers(data.maxPlayers ?? settings.maxPlayers ?? 10)
            setMaxSpectators(data.maxSpectators ?? settings.maxSpectators ?? 4)
            setRoles(data.roles || settings.roles || DEFAULT_ROLES)
            setRoleMode(data.roleMode === 'custom' ? 'custom' : (settings.roleMode === 'custom' ? 'custom' : 'auto'))
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
    if (!vote || isDead || voteLocked || phaseRef.current !== 'vote') return
    const voterId = peerRef.current?.id
    if (!voterId) return

    if (isHost) {
      if (registerDayVote(voterId, vote)) setVoteLocked(true)
      return
    }

    if (hostConnRef.current?.open) {
      hostConnRef.current.send({ type: 'player-vote', target: vote })
      setVoteLocked(true)
    }
  }

  const timerText = `${String(Math.floor(discussion / 60)).padStart(2, '0')}:${String(discussion % 60).padStart(2, '0')}`
  const configuredRoleSlots = roles.reduce((sum, role) => sum + role.count, 0)
  const killerSlots = roles
    .filter(role => role.id === 'visibleKiller' || role.id === 'hiddenKiller')
    .reduce((sum, role) => sum + role.count, 0)
  const loverSlots = roles.find(role => role.id === 'lover')?.count || 0
  const citizenSlots = Math.max(0, players.length - configuredRoleSlots)
  const roleConfigValid = configuredRoleSlots <= players.length && killerSlots >= 1 && (loverSlots === 0 || loverSlots === 2)
  const allReady = players.length >= 2 && players.every(p => p.connected !== false && p.ready) && roleConfigValid
  const observerMode = isDead || joinMode === 'spectator'

  return (
    <main className="palermoShell" data-screen={screen}>
      <div className="noirBackdrop" aria-hidden="true">
        <div className="noirSkyline" />
        <div className="noirFog fogOne" />
        <div className="noirFog fogTwo" />
        <div className="noirRain" />
        <div className="noirBlinds" />
        <div className="noirLampGlow" />
        <div className="mafiaVelvetGlow velvetLeft" />
        <div className="mafiaVelvetGlow velvetRight" />
        <div className="mafiaSmoke smokeLeft" />
        <div className="mafiaSmoke smokeRight" />
      </div>
      <div className="cinemaGrain" aria-hidden="true" />
      <div className="cinemaScratch scratchOne" aria-hidden="true" />
      <div className="cinemaScratch scratchTwo" aria-hidden="true" />
      <div className="cinemaBar cinemaBarTop" aria-hidden="true" />
      <div className="cinemaBar cinemaBarBottom" aria-hidden="true" />
      <div className="palermoNoise" />
      <header className="palermoTop">
        <div className="palermoBrand">
          <span className="brandSeal">P</span>
          <span className="brandCopy"><b>PALERMO</b><small>{lang === 'el' ? 'Η ΝΥΧΤΑ ΕΧΕΙ ΚΑΝΟΝΕΣ' : 'THE NIGHT HAS RULES'}</small></span>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {screen !== 'language' && <button onClick={() => setScreen('language')} style={{padding:'8px 10px'}}>{lang === 'el' ? 'ΕΛ' : 'EN'}</button>}
          {screen !== 'language' && <button className="howToButton" onClick={() => setHowToOpen(true)}>{lang === 'el' ? 'ΠΩΣ ΠΑΙΖΕΤΑΙ' : 'HOW TO PLAY'}</button>}
          {screen !== 'language' && <button className="leaderboardButton" onClick={openLeaderboard}>{lang === 'el' ? 'ΚΑΤΑΤΑΞΗ' : 'LEADERBOARD'}</button>}
          {screen !== 'language' && (
            <button className="accountButton" onClick={() => { setAuthMessage(''); setProfileNameDraft(profile?.username || ''); setAuthOpen(true); if (profile) fetchMatchHistory() }}>
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : <span>{profile?.username?.[0]?.toUpperCase() || '👤'}</span>}
              <b>{profile?.username || (lang === 'el' ? 'ΣΥΝΔΕΣΗ' : 'SIGN IN')}</b>
            </button>
          )}
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
          <div className="caseKicker mafiaKicker">
            <span>PALERMO // AFTER DARK</span>
            <i>{lang === 'el' ? 'ΙΔΙΩΤΙΚΗ ΣΥΝΑΝΤΗΣΗ' : 'PRIVATE MEETING'}</i>
          </div>
          <div className="palermoEyebrow">{t('social')}</div>
          <h1>PALERMO<br/><span>ONLINE.</span></h1>
          <p>{t('intro')}</p>
          <div className="noirTagline mafiaTagline">
            <span>◆</span>
            <b>{lang === 'el'
              ? 'Η εμπιστοσύνη κοστίζει. Η προδοσία κοστίζει περισσότερο.'
              : 'Trust is expensive. Betrayal costs more.'}</b>
          </div>

          <div className="palermoEntry card dossierCard">
            <div className="caseFileTab mafiaFileTab">{lang === 'el' ? 'ΤΟ ΤΡΑΠΕΖΙ' : 'THE TABLE'}</div>
            <div className="caseStamp mafiaStamp">{lang === 'el' ? 'ΜΟΝΟ ΜΕ ΠΡΟΣΚΛΗΣΗ' : 'BY INVITATION'}</div>
            <label>{t('displayName')}</label>
            <input value={name} onChange={e => setName(e.target.value)} maxLength={18} placeholder="e.g. Soul" disabled={!!profile} />
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
          <div className="card joinCard dossierCard">
            <div className="caseFileTab mafiaFileTab">{lang === 'el' ? 'ΙΔΙΩΤΙΚΟ ΔΩΜΑΤΙΟ' : 'PRIVATE ROOM'}</div>
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
          <div className="caseMetaBar mafiaMetaBar">
            <span>{lang === 'el' ? 'ΙΔΙΩΤΙΚΟ ΤΡΑΠΕΖΙ' : 'PRIVATE TABLE'} // {roomCode}</span>
            <b>{lang === 'el' ? 'Η ΟΙΚΟΓΕΝΕΙΑ ΜΑΖΕΥΕΤΑΙ' : 'THE FAMILY IS GATHERING'}</b>
          </div>
          <div className="lobbyHead">
            <div>
              <div className="palermoEyebrow">{t('privateRoom')} // {connectionState === 'connected' ? t('connected') : t('connecting')}</div>
              <h2>{t('room')} <span>{roomCode}</span></h2>
            </div>
            <div className="lobbyHeadActions">
              <button className="backBtn" onClick={() => leaveToBrowser(true)}>
                ← {lang === 'el' ? (isHost ? 'ΚΛΕΙΣΙΜΟ LOBBY' : 'ΠΙΣΩ') : (isHost ? 'CLOSE LOBBY' : 'BACK')}
              </button>
              <button className="copyCode" onClick={() => navigator.clipboard?.writeText(roomCode)}>{t('copyCode')}</button>
              <button className="inviteButton primary" onClick={shareRoomInvite}>
                {shareStatus === 'copied' ? t('inviteCopied') : `↗ ${t('inviteFriends')}`}
              </button>
            </div>
          </div>
          <div className="inviteHint">
            <span>{lang === 'el' ? 'Μοιράσου τον σύνδεσμο — ο κωδικός του δωματίου συμπληρώνεται αυτόματα.' : 'Share the link — the room code is filled in automatically.'}</span>
          </div>

          <div className="lobbyGrid">
            <div className="card playersCard evidenceCard">
              <div className="cardTitle"><span>{t('players')}</span><b>{players.length}/{maxPlayers}</b></div>
              <div className="playerList">
                {players.map((player, i) => (
                  <div className="playerRow" key={player.id || i}>
                    <span className="avatar">{player.avatarUrl ? <img src={player.avatarUrl} alt="" /> : player.name.slice(0,1).toUpperCase()}</span>
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

            <div className="card settingsCard caseSettingsCard">
              <div className="cardTitle"><span>{isHost ? t('hostSettings') : t('roomSettings')}</span><b>{isHost ? t('host') : t('synced')}</b></div>

              <div className="settingsRow">
                <label>{t('maxPlayers')} <b>{maxPlayers}</b></label>
                <input disabled={!isHost} type="range" min={Math.max(2, players.length)} max="16" value={maxPlayers} onChange={e => changeMaxPlayers(e.target.value)} />
              </div>

              <div className="settingsRow">
                <label>{t('maxSpectators')} <b>{maxSpectators}</b></label>
                <input disabled={!isHost} type="range" min={spectators.length} max="10" value={maxSpectators} onChange={e => changeMaxSpectators(e.target.value)} />
              </div>

              {isHost && pendingRequests.length > 0 && (
                <div style={{margin:'16px 0'}}>
                  <div className="cardTitle"><span>{t('joinRequests')}</span><b>{pendingRequests.length}</b></div>
                  {pendingRequests.map(req => (
                    <div className="joinRequestRow" key={req.peerId}>
                      <div className="joinRequestPlayer">
                        <span className="avatar">{req.avatarUrl ? <img src={req.avatarUrl} alt="" /> : req.name.slice(0,1).toUpperCase()}</span>
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
                <div className="roleModeHeader">
                  <div>
                    <span>⚙ {lang === 'el' ? 'ΡΥΘΜΙΣΗ ΡΟΛΩΝ' : 'ROLE SETUP'}</span>
                    <small>{roleMode === 'auto'
                      ? (lang === 'el' ? `Ισορροπημένοι αυτόματα για ${players.length} παίκτες` : `Balanced automatically for ${players.length} players`)
                      : (lang === 'el' ? 'Ο host επιλέγει τους ειδικούς ρόλους' : 'The host chooses the special roles')}</small>
                  </div>
                  <div className="roleModeSwitch">
                    <button
                      className={roleMode === 'auto' ? 'active' : ''}
                      disabled={!isHost}
                      onClick={() => changeRoleMode('auto')}
                    >{lang === 'el' ? 'ΑΥΤΟΜΑΤΟ' : 'AUTO'}</button>
                    <button
                      className={roleMode === 'custom' ? 'active' : ''}
                      disabled={!isHost}
                      onClick={() => changeRoleMode('custom')}
                    >{lang === 'el' ? 'ΠΡΟΣΑΡΜΟΣΜΕΝΟ' : 'CUSTOM'}</button>
                  </div>
                </div>

                {roles.map(role => {
                  const max = role.id === 'visibleKiller' ? 1
                    : role.id === 'hiddenKiller' ? 3
                    : role.id === 'lover' ? 2
                    : 1
                  const minusDisabled = !isHost || roleMode !== 'custom' || role.count <= role.min
                  const plusDisabled = !isHost || roleMode !== 'custom' || role.count >= max
                  return (
                    <div className="roleConfigRow" key={role.id}>
                      <span>{role.emoji} {roleName(role)}</span>
                      {roleMode === 'custom' ? (
                        <div className="customRoleControls">
                          <button disabled={minusDisabled} onClick={() => changeRole(role.id, -1)}>−</button>
                          <b>{role.count}</b>
                          <button disabled={plusDisabled} onClick={() => changeRole(role.id, 1)}>+</button>
                        </div>
                      ) : (
                        <div className="autoRoleCount"><b>{role.count}</b></div>
                      )}
                    </div>
                  )
                })}
                <div className="roleConfigRow citizenAutoRow">
                  <span>👤 {t('citizen')}</span>
                  <div className="autoRoleCount"><b>{citizenSlots}</b></div>
                </div>
                {roleMode === 'custom' && (
                  <div className="customRoleHint">
                    {lang === 'el'
                      ? 'Οι Πολίτες συμπληρώνουν αυτόματα τις κενές θέσεις. Η αλλαγή ρόλων μηδενίζει το Ready όλων.'
                      : 'Citizens automatically fill unused slots. Changing roles resets everyone’s Ready status.'}
                  </div>
                )}
              </div>

              {!roleConfigValid && (
                <div className="prototypeNotice">
                  {configuredRoleSlots > players.length
                    ? (lang === 'el' ? 'Υπάρχουν περισσότεροι ειδικοί ρόλοι από παίκτες.' : 'There are more special-role slots than players.')
                    : killerSlots < 1
                    ? (lang === 'el' ? 'Χρειάζεται τουλάχιστον ένας Δολοφόνος.' : 'At least one Killer is required.')
                    : (lang === 'el' ? 'Οι Ερωτευμένοι πρέπει να είναι ακριβώς δύο ή καθόλου.' : 'Lovers must be exactly two or disabled.')}
                </div>
              )}
              <div className="roleTotal">{t('spectators')} <b>{spectators.length}/{maxSpectators}</b></div>
              {spectators.map(s => <div className="playerRow" key={s.id}><span className="avatar">{s.avatarUrl ? <img src={s.avatarUrl} alt="" /> : s.name[0]}</span><strong>{s.name}</strong><small>{t('spectator')}</small></div>)}
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
          <div className={`roleReveal card roleRevealAnimated role-${myRole.id}`}>
            <div className="classifiedStrip mafiaOrders">{lang === 'el' ? 'ΙΔΙΩΤΙΚΕΣ ΕΝΤΟΛΕΣ // ΚΡΑΤΗΣΕ ΤΟ ΜΥΣΤΙΚΟ' : 'PRIVATE ORDERS // KEEP IT QUIET'}</div>
            <div className="palermoEyebrow">{t('privateScreen')}</div>
            <div className="roleEmoji">{myRole.emoji}</div>
            <small>{t('yourRole')}</small>
            <h2>{roleName(myRole).toUpperCase()}</h2>
            {(myRole.id === 'visibleKiller' || myRole.id === 'hiddenKiller') && myRole.killerTeammates?.length > 0 && (
              <div className="killerTeammatesNotice">
                <small>{lang === 'el' ? 'ΑΛΛΟΣ ΔΟΛΟΦΟΝΟΣ' : 'OTHER KILLER'}</small>
                <strong>{myRole.killerTeammates.join(', ')}</strong>
              </div>
            )}
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
            <div className="syncedRoleCountdown">
              <small>{lang === 'el' ? 'ΤΟ ΠΑΙΧΝΙΔΙ ΞΕΚΙΝΑ ΣΕ' : 'GAME STARTS IN'}</small>
              <strong>{countdown ?? 0}</strong>
              <span>{lang === 'el' ? 'Όλοι οι παίκτες ξεκινούν ταυτόχρονα' : 'All players start together'}</span>
            </div>
          </div>
        </section>
      )}

      {screen === 'game' && (
        <section className={`gameWrap phase-${phase}`}>
          <div key={`phase-${phase}-${round}`} className={`phaseTransitionFlash ${phase}`} aria-hidden="true">
            <span>{phase === 'night' ? '🌙' : phase === 'day' ? '☀️' : '🗳️'}</span>
            <strong>{phase === 'night' ? t('night') : phase === 'day' ? t('day') : t('voting')}</strong>
          </div>
          {resultBanner && (
            <div key={resultBanner.id} className={`resultBanner ${resultBanner.kind}`}>
              <strong>{resultBanner.title}</strong>
              {resultBanner.detail && <span>{resultBanner.detail}</span>}
            </div>
          )}
          <div className="caseMetaBar gameCaseMeta mafiaMetaBar">
            <span>{lang === 'el' ? 'Η ΣΥΝΑΝΤΗΣΗ' : 'THE SIT-DOWN'} // {roomCode}</span>
            <b>{lang === 'el' ? `ΝΥΧΤΑ ${round}` : `NIGHT ${round}`}</b>
          </div>
          <div className="gameTop">
            <div><small>{t('room')} {roomCode}</small><h2>{t('round')} {round}</h2></div>
            <div className={`phasePill ${phase}`}>{phase === 'night' ? `🌙 ${t('night')}` : phase === 'day' ? `☀️ ${t('day')}` : `🗳️ ${t('voting')}`}</div>
          </div>

          {observerMode && (
            <div className="observerModeBanner">
              <div>
                <span>👁</span>
                <div>
                  <strong>{joinMode === 'spectator'
                    ? (lang === 'el' ? 'ΛΕΙΤΟΥΡΓΙΑ ΘΕΑΤΗ' : 'SPECTATOR MODE')
                    : (lang === 'el' ? 'ΕΧΕΙΣ ΑΠΟΚΛΕΙΣΤΕΙ' : 'YOU WERE ELIMINATED')}</strong>
                  <small>{lang === 'el'
                    ? 'Παρακολούθησε το παιχνίδι και μίλα μόνο στο chat θεατών. Μην αποκαλύπτεις ρόλους στους ζωντανούς παίκτες.'
                    : 'Watch the match and use spectator chat only. Do not reveal roles to living players.'}</small>
                </div>
              </div>
              <b>{lang === 'el' ? 'ΜΟΝΟ ΠΑΡΑΚΟΛΟΥΘΗΣΗ' : 'WATCH ONLY'}</b>
            </div>
          )}
          <div className="gameGrid">
            <aside className="card playerBoard suspectBoard">
              <div className="evidencePin pinOne" />
              <div className="evidencePin pinTwo" />
              <div className="cardTitle">
                <span>{lang === 'el' ? 'ΠΑΙΚΤΕΣ' : 'PLAYERS'}</span>
                <b>{gameRoster.filter(p => p.alive).length}/{gameRoster.length} {lang === 'el' ? 'ΖΩΝΤΑΝΟΙ' : 'ALIVE'}</b>
              </div>
              <div className="playerBoardList">
                {gameRoster.map((player, index) => (
                  <div className={`playerBoardRow ${player.alive ? 'alive' : 'dead'}`} key={player.id || index}>
                    <span className="playerBoardAvatar">
                      {(() => {
                        const source = players.find(p => p.id === player.id)
                        return source?.avatarUrl
                          ? <img src={source.avatarUrl} alt="" />
                          : (player.name?.[0]?.toUpperCase() || '?')
                      })()}
                    </span>
                    <div className="playerBoardMeta">
                      <strong>{player.name}</strong>
                      <small>{player.connected === false
  ? (lang === 'el' ? 'ΕΠΑΝΑΣΥΝΔΕΣΗ...' : 'RECONNECTING...')
  : player.alive
  ? (lang === 'el' ? 'ΖΩΝΤΑΝΟΣ' : 'ALIVE')
  : (lang === 'el' ? 'ΝΕΚΡΟΣ' : 'DEAD')}</small>
                    </div>
                    <span className={`playerStatusDot ${player.connected === false ? 'reconnecting' : player.alive ? 'alive' : 'dead'}`} />
                  </div>
                ))}
              </div>
            </aside>

            <div key={`${phase}-${round}`} className={`card phaseCard phaseCardAnimated ${phase} interrogationPanel`}>
              <div className="phaseCaseLabel mafiaPhaseLabel">
                {phase === 'night'
                  ? (lang === 'el' ? 'Η ΔΟΥΛΕΙΑ ΤΗΣ ΝΥΧΤΑΣ' : 'THE NIGHT BUSINESS')
                  : phase === 'day'
                  ? (lang === 'el' ? 'ΤΟ ΣΥΜΒΟΥΛΙΟ' : 'THE SIT-DOWN')
                  : (lang === 'el' ? 'Η ΑΠΟΦΑΣΗ' : 'THE VERDICT')}
              </div>
              {phase === 'night' && <>
                <div className="bigIcon">🌙</div>
                <h3>{t('citySleeping')}</h3>
                {!observerMode && (myRole?.id === 'visibleKiller' || myRole?.id === 'hiddenKiller') ? (
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
                ) : !observerMode && myRole?.id === 'doctor' ? (
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
                ) : !observerMode && myRole?.id === 'detective' && round === 1 && myRole?.knownVisibleKiller ? (
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
                {!observerMode && myRole?.id === 'kamikaze' && (
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
                {!observerMode && (
                  <div className="dayChatBox">
                    <div className="dayMessages">
                      {dayMessages.length === 0 && (
                        <div className="prototypeNotice">
                          {lang === 'el' ? 'Δεν υπάρχουν μηνύματα ακόμα. Ξεκίνα τη συζήτηση.' : 'No messages yet. Start the discussion.'}
                        </div>
                      )}
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
                    <button
                      className={vote === p.name ? 'selected' : ''}
                      onClick={() => !observerMode && !voteLocked && setVote(p.name)}
                      disabled={observerMode || voteLocked}
                      key={p.id}
                    >{p.name}</button>
                  ))}
                  <button
                    className={vote === 'skip' ? 'selected' : ''}
                    onClick={() => !observerMode && !voteLocked && setVote('skip')}
                    disabled={observerMode || voteLocked}
                  >{t('skipVote')}</button>
                </div>
                {voteLocked && (
                  <div className="voteLockedNotice">
                    ✓ {lang === 'el' ? `Η ΨΗΦΟΣ ΚΛΕΙΔΩΘΗΚΕ: ${vote === 'skip' ? 'SKIP' : vote}` : `VOTE LOCKED: ${vote === 'skip' ? 'SKIP' : vote}`}
                  </div>
                )}
                <button className="primary wide" disabled={!vote || observerMode || voteLocked} onClick={finishVote}>
                  {voteLocked ? (lang === 'el' ? 'Η ΨΗΦΟΣ ΚΛΕΙΔΩΘΗΚΕ' : 'VOTE LOCKED') : t('lockVote')}
                </button>
              </>}
            </div>

            <div className="sideStack">
              <div className={`card miniRole ${observerMode ? 'observer' : ''}`}>
                <small>{joinMode === 'spectator' ? t('spectator') : t('yourRole')}</small>
                <strong>{joinMode === 'spectator' ? '👁 ' + t('spectator') : `${myRole?.emoji || ''} ${roleName(myRole)}`}</strong>
                <span>{joinMode === 'spectator'
                  ? (lang === 'el' ? 'ΠΑΡΑΚΟΛΟΥΘΗΣΗ // ΧΩΡΙΣ ΨΗΦΟ' : 'WATCHING // NO VOTE')
                  : isDead
                  ? ('☠ ' + t('dead') + ' // ' + t('spectatorOnly'))
                  : t('alive')}</span>
              </div>
              <div className="card voiceBox">
                <div className="cardTitle"><span>{t('narrator')}</span><b>{narratorOn ? t('narratorOn') : t('narratorOff')}</b></div>
                <button onClick={() => { stopNarrator(); setNarratorOn(v => !v) }}>{narratorOn ? t('narratorOn') : t('narratorOff')}</button>
                <p>{t('narratorHint')}</p>
              </div>
              {observerMode && spectatorRoleRoster.length > 0 && (
                <div className="card observerRoleBoard">
                  <div className="cardTitle">
                    <span>{lang === 'el' ? 'ΡΟΛΟΙ ΠΑΙΧΝΙΔΙΟΥ' : 'GAME ROLES'}</span>
                    <b>👁 {lang === 'el' ? 'ΘΕΑΤΕΣ' : 'OBSERVERS'}</b>
                  </div>
                  <p>{lang === 'el'
                    ? 'Οι ρόλοι εμφανίζονται μόνο σε νεκρούς παίκτες και θεατές.'
                    : 'Roles are visible only to eliminated players and spectators.'}</p>
                  <div className="observerRoleList">
                    {spectatorRoleRoster.map(player => (
                      <div className={`observerRoleRow ${player.alive ? 'alive' : 'dead'}`} key={player.id}>
                        <span>{player.alive ? '●' : '☠'} {player.name}</span>
                        <strong>{roleName({ id: player.roleId })}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {observerMode && (
                <div className="card spectatorChat">
                  <div className="cardTitle">
                    <span>{t('spectatorChat')}</span>
                    <b>{spectators.length + gameRoster.filter(p => !p.alive).length} {lang === 'el' ? 'ΠΑΡΑΤΗΡΗΤΕΣ' : 'OBSERVERS'}</b>
                  </div>
                  <p>{t('spectatorChatHint')}</p>
                  <div className="spectatorMessages">
                    {spectatorMessages.length === 0 && (
                      <div className="spectatorChatEmpty">{lang === 'el' ? 'Δεν υπάρχουν μηνύματα ακόμα.' : 'No spectator messages yet.'}</div>
                    )}
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

            </div>
          </div>
        </section>
      )}

      {screen === 'gameOver' && (
        <section className="roleRevealWrap">
          <div className="roleReveal card endGameCard gameOverAnimated closedCaseFile">
            <div className="caseClosedStamp mafiaClosedStamp">{lang === 'el' ? 'Η ΔΟΥΛΕΙΑ ΤΕΛΕΙΩΣΕ' : 'BUSINESS CONCLUDED'}</div>
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

      {leaderboardOpen && (
        <div className="leaderboardBackdrop" onClick={() => setLeaderboardOpen(false)}>
          <div className="leaderboardModal card" onClick={e => e.stopPropagation()}>
            <div className="leaderboardHead">
              <div>
                <div className="palermoEyebrow">PALERMO // RANKINGS</div>
                <h2>{lang === 'el' ? 'ΚΑΤΑΤΑΞΗ' : 'LEADERBOARD'}</h2>
                <p>{lang === 'el' ? 'Οι κατατάξεις μετράνε μόνο παιχνίδια από συνδεδεμένους λογαριασμούς.' : 'Rankings count completed matches from signed-in accounts only.'}</p>
              </div>
              <button className="bugClose" onClick={() => setLeaderboardOpen(false)}>×</button>
            </div>

            <div className="leaderboardLegend">
              <span>#</span><span>{lang === 'el' ? 'ΠΑΙΚΤΗΣ' : 'PLAYER'}</span><span>{lang === 'el' ? 'ΝΙΚΕΣ' : 'WINS'}</span><span>MVP</span><span>{lang === 'el' ? 'ΠΑΙΧΝΙΔΙΑ' : 'GAMES'}</span><span>WIN %</span>
            </div>

            <div className="leaderboardList">
              {leaderboardLoading && <div className="leaderboardEmpty">{lang === 'el' ? 'ΦΟΡΤΩΣΗ...' : 'LOADING...'}</div>}
              {!leaderboardLoading && leaderboardError && <div className="errorText">{leaderboardError}</div>}
              {!leaderboardLoading && !leaderboardError && leaderboardRows.length === 0 && (
                <div className="leaderboardEmpty">{lang === 'el' ? 'Δεν υπάρχουν ranked παιχνίδια ακόμα.' : 'No ranked matches yet.'}</div>
              )}
              {!leaderboardLoading && leaderboardRows.map((row, index) => {
                const rate = row.games_played > 0 ? Math.round((row.wins / row.games_played) * 100) : 0
                return (
                  <div className={`leaderboardRow ${profile?.id === row.id ? 'isMe' : ''}`} key={row.id}>
                    <b className="leaderboardRank">{index + 1}</b>
                    <div className="leaderboardPlayer">
                      <span className="leaderboardAvatar">{row.avatar_url ? <img src={row.avatar_url} alt="" /> : row.username?.[0]?.toUpperCase()}</span>
                      <strong>{row.username}{profile?.id === row.id ? (lang === 'el' ? ' (ΕΣΥ)' : ' (YOU)') : ''}</strong>
                    </div>
                    <b>{row.wins || 0}</b>
                    <b>{row.mvps || 0}</b>
                    <span>{row.games_played || 0}</span>
                    <span>{rate}%</span>
                  </div>
                )
              })}
            </div>

            <button className="wide" onClick={fetchLeaderboard} disabled={leaderboardLoading}>
              {lang === 'el' ? 'ΑΝΑΝΕΩΣΗ' : 'REFRESH'}
            </button>
          </div>
        </div>
      )}

      {authOpen && (
        <div className="authBackdrop" onClick={() => setAuthOpen(false)}>
          <div className="authModal card" onClick={e => e.stopPropagation()}>
            <div className="authHead">
              <div>
                <div className="palermoEyebrow">PALERMO // PROFILE</div>
                <h2>{profile ? (lang === 'el' ? 'ΤΟ ΠΡΟΦΙΛ ΣΟΥ' : 'YOUR PROFILE') : (authMode === 'signup' ? (lang === 'el' ? 'ΔΗΜΙΟΥΡΓΙΑ ΛΟΓΑΡΙΑΣΜΟΥ' : 'CREATE ACCOUNT') : (lang === 'el' ? 'ΣΥΝΔΕΣΗ' : 'SIGN IN'))}</h2>
              </div>
              <button className="bugClose" onClick={() => setAuthOpen(false)}>×</button>
            </div>

            {profile ? (
              <div className="profilePanel">
                <div className="profileHero">
                  <label className="profileAvatarPicker">
                    {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : <span>{profile.username?.[0]?.toUpperCase() || 'P'}</span>}
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e => uploadAvatar(e.target.files?.[0])} />
                  </label>
                  <div>
                    <strong>{profile.username}</strong>
                    <small>{authSession?.user?.email}</small>
                    <span>{avatarUploading ? (lang === 'el' ? 'ΑΝΕΒΑΖΕΙ...' : 'UPLOADING...') : (lang === 'el' ? 'ΠΑΤΑ ΤΗΝ ΕΙΚΟΝΑ ΓΙΑ ΑΛΛΑΓΗ' : 'CLICK IMAGE TO CHANGE')}</span>
                  </div>
                </div>
                <label>{lang === 'el' ? 'USERNAME' : 'USERNAME'}</label>
                <input value={profileNameDraft} onChange={e => setProfileNameDraft(e.target.value)} maxLength={18} />
                <div className="profileStats">
                  <div><b>{profile.games_played || 0}</b><span>{lang === 'el' ? 'ΠΑΙΧΝΙΔΙΑ' : 'GAMES'}</span></div>
                  <div><b>{profile.wins || 0}</b><span>{lang === 'el' ? 'ΝΙΚΕΣ' : 'WINS'}</span></div>
                  <div><b>{profile.losses || 0}</b><span>{lang === 'el' ? 'ΗΤΤΕΣ' : 'LOSSES'}</span></div>
                  <div><b>{profile.mvps || 0}</b><span>MVP</span></div>
                  <div><b>{profile.games_played > 0 ? Math.round(((profile.wins || 0) / profile.games_played) * 100) : 0}%</b><span>{lang === 'el' ? 'ΠΟΣΟΣΤΟ ΝΙΚΗΣ' : 'WIN RATE'}</span></div>
                </div>

                <div className="matchHistoryBlock">
                  <div className="matchHistoryHead">
                    <div>
                      <small>{lang === 'el' ? 'ΠΡΟΣΦΑΤΑ ΠΑΙΧΝΙΔΙΑ' : 'RECENT MATCHES'}</small>
                      <strong>{lang === 'el' ? 'ΙΣΤΟΡΙΚΟ ΑΓΩΝΩΝ' : 'MATCH HISTORY'}</strong>
                    </div>
                    <button onClick={fetchMatchHistory} disabled={matchHistoryLoading}>
                      {matchHistoryLoading ? '...' : (lang === 'el' ? 'ΑΝΑΝΕΩΣΗ' : 'REFRESH')}
                    </button>
                  </div>
                  {matchHistoryLoading && matchHistory.length === 0 && <div className="matchHistoryEmpty">{lang === 'el' ? 'ΦΟΡΤΩΣΗ...' : 'LOADING...'}</div>}
                  {!matchHistoryLoading && matchHistoryError && <div className="errorText">{matchHistoryError}</div>}
                  {!matchHistoryLoading && !matchHistoryError && matchHistory.length === 0 && (
                    <div className="matchHistoryEmpty">{lang === 'el' ? 'Δεν υπάρχουν καταγεγραμμένα παιχνίδια ακόμα.' : 'No recorded matches yet.'}</div>
                  )}
                  <div className="matchHistoryList">
                    {matchHistory.map(match => (
                      <div className={`matchHistoryRow ${match.won ? 'won' : 'lost'}`} key={match.id}>
                        <div className="matchHistoryResult">
                          <b>{match.won ? (lang === 'el' ? 'ΝΙΚΗ' : 'WIN') : (lang === 'el' ? 'ΗΤΤΑ' : 'LOSS')}</b>
                          <small>{new Date(match.created_at).toLocaleDateString(lang === 'el' ? 'el-GR' : 'en-GB', { day:'2-digit', month:'short' })}</small>
                        </div>
                        <div className="matchHistoryRole">
                          <strong>{roleName({ id: match.role_id })}</strong>
                          <span>{lang === 'el' ? `${match.rounds} γύροι · ${match.player_count} παίκτες` : `${match.rounds} rounds · ${match.player_count} players`}</span>
                        </div>
                        <div className="matchHistoryBadges">
                          {match.mvp && <span>MVP</span>}
                          <small>{match.winner === 'killers' ? (lang === 'el' ? 'ΔΟΛΟΦΟΝΟΙ' : 'KILLERS') : match.winner === 'citizens' ? (lang === 'el' ? 'ΠΟΛΙΤΕΣ' : 'CITIZENS') : match.winner === 'madness' ? (lang === 'el' ? 'ΤΡΕΛΑ' : 'MADNESS') : '—'}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {authMessage && <div className={authStatus === 'error' ? 'errorText' : 'authSuccess'}>{authMessage}</div>}
                <div className="authActions">
                  <button className="primary" disabled={authStatus === 'loading' || profileNameDraft.trim().length < 2} onClick={saveProfileName}>{lang === 'el' ? 'ΑΠΟΘΗΚΕΥΣΗ' : 'SAVE PROFILE'}</button>
                  <button className="danger" onClick={logoutAccount}>{lang === 'el' ? 'ΑΠΟΣΥΝΔΕΣΗ' : 'SIGN OUT'}</button>
                </div>
              </div>
            ) : (
              <>
                <div className="modeSwitch">
                  <button className={authMode === 'login' ? 'active' : ''} onClick={() => { setAuthMode('login'); setAuthMessage('') }}>{lang === 'el' ? 'ΣΥΝΔΕΣΗ' : 'SIGN IN'}</button>
                  <button className={authMode === 'signup' ? 'active' : ''} onClick={() => { setAuthMode('signup'); setAuthMessage('') }}>{lang === 'el' ? 'ΕΓΓΡΑΦΗ' : 'CREATE ACCOUNT'}</button>
                </div>
                {authMode === 'signup' && (
                  <>
                    <label>USERNAME</label>
                    <input value={authUsername} onChange={e => setAuthUsername(e.target.value)} maxLength={18} placeholder="Soul" />
                  </>
                )}
                <label>EMAIL</label>
                <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="you@example.com" />
                <label>PASSWORD</label>
                <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} minLength={6} placeholder="••••••••" />
                {authMessage && <div className={authStatus === 'error' ? 'errorText' : 'authSuccess'}>{authMessage}</div>}
                <button className="primary wide authSubmit" disabled={authStatus === 'loading'} onClick={submitAuth}>
                  {authStatus === 'loading' ? (lang === 'el' ? 'ΠΕΡΙΜΕΝΕ...' : 'PLEASE WAIT...') : authMode === 'signup' ? (lang === 'el' ? 'ΔΗΜΙΟΥΡΓΙΑ ΛΟΓΑΡΙΑΣΜΟΥ' : 'CREATE ACCOUNT') : (lang === 'el' ? 'ΣΥΝΔΕΣΗ' : 'SIGN IN')}
                </button>
                <p className="authHint">{lang === 'el' ? 'Η σύνδεσή σου αποθηκεύεται σε αυτή τη συσκευή ώστε το προφίλ και η μελλοντική πρόοδος να παραμένουν.' : 'Your login stays saved on this device so your profile and future progress remain available.'}</p>
              </>
            )}
          </div>
        </div>
      )}

      {howToOpen && (
        <div className="howToBackdrop" onClick={() => setHowToOpen(false)}>
          <div className="howToModal card" onClick={e => e.stopPropagation()}>
            <div className="howToHead">
              <div>
                <div className="palermoEyebrow">PALERMO // GUIDE</div>
                <h2>{lang === 'el' ? 'ΠΩΣ ΠΑΙΖΕΤΑΙ' : 'HOW TO PLAY'}</h2>
              </div>
              <button className="bugClose" onClick={() => setHowToOpen(false)}>×</button>
            </div>

            <div className="howToIntro">
              {lang === 'el'
                ? 'Στόχος σου εξαρτάται από τον ρόλο σου. Οι πολίτες προσπαθούν να βρουν και να βγάλουν τους δολοφόνους. Οι δολοφόνοι προσπαθούν να μείνουν ζωντανοί μέχρι να μείνουν μόνο αυτοί και ένας ακόμη μη δολοφόνος.'
                : 'Your objective depends on your role. Citizens try to identify and eliminate both killers. The killers try to survive until only the killers and one non-killer remain alive.'}
            </div>

            <div className="howToSection">
              <h3>{lang === 'el' ? 'ΡΟΗ ΠΑΙΧΝΙΔΙΟΥ' : 'GAME FLOW'}</h3>
              <ol>
                <li>{lang === 'el' ? 'Όλοι μπαίνουν σε δωμάτιο, πατάνε Ready και ο host ξεκινά το παιχνίδι.' : 'Everyone joins a room, marks Ready, and the host starts the match.'}</li>
                <li>{lang === 'el' ? 'Κάθε παίκτης παίρνει έναν μυστικό ρόλο. Μην δείχνεις την οθόνη σου.' : 'Each player receives a secret role. Keep your screen private.'}</li>
                <li>{lang === 'el' ? 'Τη νύχτα οι ειδικοί ρόλοι κάνουν τις κρυφές ενέργειές τους.' : 'At night, special roles perform their hidden actions.'}</li>
                <li>{lang === 'el' ? 'Το πρωί ανακοινώνεται ποιος πέθανε. Οι ζωντανοί έχουν 2 λεπτά για συζήτηση μέσω text chat ή Discord/εξωτερικής φωνής.' : 'In the morning, any death is announced. Living players get 2 minutes to discuss using the in-game text chat or Discord/external voice.'}</li>
                <li>{lang === 'el' ? 'Μετά τη συζήτηση υπάρχουν 30 δευτερόλεπτα για ψηφοφορία. Μπορείς να ψηφίσεις παίκτη ή Skip.' : 'After discussion, there are 30 seconds to vote for a player or Skip.'}</li>
                <li>{lang === 'el' ? 'Ο παίκτης που βγαίνει αποκαλύπτει τον ρόλο του και συνεχίζει μόνο ως θεατής.' : 'An eliminated player has their role revealed and can only continue as a spectator.'}</li>
              </ol>
            </div>

            <div className="howToSection">
              <h3>{lang === 'el' ? 'ΝΥΧΤΑ' : 'NIGHT'}</h3>
              <ul>
                <li>{lang === 'el' ? 'Στα μεγαλύτερα παιχνίδια, οι δολοφόνοι γνωρίζουν ποιοι είναι οι άλλοι δολοφόνοι, αλλά επιλέγουν ξεχωριστά στόχο μέσα σε 15 δευτερόλεπτα. Στα μικρότερα παιχνίδια μπορεί να υπάρχει μόνο ένας δολοφόνος.' : 'In larger games, killers know who the other killers are, but each still chooses a target independently within 15 seconds. Smaller games may use only one killer.'}</li>
                <li>{lang === 'el' ? 'Αν επιλέξουν το ίδιο άτομο, αυτό είναι ο στόχος. Αν επιλέξουν διαφορετικούς, το παιχνίδι επιλέγει τυχαία ανάμεσα στους δύο στόχους.' : 'If both killers choose the same person, that is the target. If they disagree, the game randomly chooses between their two targets.'}</li>
                <li>{lang === 'el' ? 'Ο Γιατρός προστατεύει έναν ζωντανό παίκτη κάθε νύχτα, ακόμα και τον εαυτό του ή έναν δολοφόνο. Αν προστατέψει το θύμα, κανείς δεν πεθαίνει.' : 'The Doctor protects one living player every night, including themself or a killer. If the protected player is targeted, nobody dies.'}</li>
                <li>{lang === 'el' ? 'Την πρώτη νύχτα ο Ντετέκτιβ βλέπει ποιος είναι ο Φανερός Δολοφόνος.' : 'On the first night, the Detective privately learns who the Revealed Killer is.'}</li>
                <li>{lang === 'el' ? 'Οι νεκροί δεν συμμετέχουν πλέον στις ενέργειες του παιχνιδιού.' : 'Dead players no longer take part in gameplay actions.'}</li>
              </ul>
            </div>

            <div className="howToSection">
              <h3>{lang === 'el' ? 'ΡΟΛΟΙ' : 'ROLES'}</h3>
              <div className="roleGuideGrid">
                <div><strong>🔪 {t('visibleKiller')}</strong><p>{lang === 'el' ? 'Δολοφόνος. Επιλέγει κρυφά έναν στόχο κάθε νύχτα και γνωρίζει ποιοι είναι οι άλλοι δολοφόνοι.' : 'Killer. Privately chooses one target each night and knows who the other killers are.'}</p></div>
                <div><strong>🗡️ {t('hiddenKiller')}</strong><p>{lang === 'el' ? 'Δολοφόνος. Έχει την ίδια νυχτερινή ενέργεια και γνωρίζει ποιοι είναι οι άλλοι δολοφόνοι.' : 'Killer. Has the same nightly action and knows who the other killers are.'}</p></div>
                <div><strong>🕵️ {t('detective')}</strong><p>{lang === 'el' ? 'Την πρώτη νύχτα μαθαίνει ιδιωτικά ποιος είναι ο Φανερός Δολοφόνος.' : 'Privately learns the Revealed Killer’s identity on the first night.'}</p></div>
                <div><strong>🩺 {t('doctor')}</strong><p>{lang === 'el' ? 'Προστατεύει έναν παίκτη κάθε νύχτα. Μπορεί να προστατεύσει και τον εαυτό του.' : 'Protects one player every night and may protect themself.'}</p></div>
                <div><strong>❤️ {t('lover')}</strong><p>{lang === 'el' ? 'Οι δύο Ερωτευμένοι είναι δεμένοι. Αν πεθάνει ο ένας, πεθαίνει και ο άλλος.' : 'The two Lovers are linked. If one dies, the other dies as well.'}</p></div>
                <div><strong>💣 {t('kamikaze')}</strong><p>{lang === 'el' ? 'Μία φορά την ημέρα μπορεί να ανατιναχτεί μαζί με έναν ζωντανό μη δολοφόνο. Πεθαίνουν και οι δύο.' : 'Once during the day, may detonate with one living non-killer. Both players die.'}</p></div>
                <div><strong>🌀 {t('madness')}</strong><p>{lang === 'el' ? 'Αν η Τρέλα ψηφιστεί και βγει από το παιχνίδι, κερδίζει αμέσως μόνη της και το παιχνίδι τελειώνει.' : 'If Madness is voted out, Madness immediately wins alone and the match ends.'}</p></div>
                <div><strong>👤 {t('citizen')}</strong><p>{lang === 'el' ? 'Δεν έχει νυχτερινή δύναμη. Συζητά, παρατηρεί και ψηφίζει για να βρει τους δολοφόνους.' : 'Has no night action. Discuss, observe, and vote to identify the killers.'}</p></div>
              </div>
            </div>

            <div className="howToSection">
              <h3>{lang === 'el' ? 'ΝΙΚΗ & ΕΙΔΙΚΟΙ ΚΑΝΟΝΕΣ' : 'WIN CONDITIONS & SPECIAL RULES'}</h3>
              <ul>
                <li>{lang === 'el' ? 'Οι πολίτες κερδίζουν όταν πεθάνουν και οι δύο δολοφόνοι.' : 'Citizens win when both killers are dead.'}</li>
                <li>{lang === 'el' ? 'Οι δολοφόνοι κερδίζουν αυτόματα όταν μείνουν ζωντανοί μαζί με μόνο έναν μη δολοφόνο.' : 'The killers automatically win when the only remaining non-killer count reaches one.'}</li>
                <li>{lang === 'el' ? 'Η Τρέλα κερδίζει αμέσως αν ψηφιστεί εκτός παιχνιδιού.' : 'Madness immediately wins if voted out.'}</li>
                <li>{lang === 'el' ? 'Οι νεκροί και οι θεατές μπαίνουν σε Λειτουργία Θεατή. Βλέπουν όλους τους ρόλους, χρησιμοποιούν ιδιωτικό spectator chat και δεν μπορούν να ψηφίσουν ή να συμμετέχουν με τους ζωντανούς. Δεν πρέπει να αποκαλύπτουν ρόλους στους ζωντανούς.' : 'Dead players and spectators enter Observer Mode. They can see all roles, use their private spectator chat, and cannot vote or participate with living players. They must not reveal role information to the living.'}</li>
                <li>{lang === 'el' ? 'Αν ενεργός παίκτης χάσει τη σύνδεση, το Palermo του δίνει 20 δευτερόλεπτα να επανασυνδεθεί και επαναφέρει τον ίδιο ρόλο και την τρέχουσα φάση. Αν αποσυνδεθεί ο host, άλλος συνδεδεμένος παίκτης γίνεται αυτόματα host ώστε το δωμάτιο να συνεχίσει.' : 'If an active player disconnects, Palermo gives them 20 seconds to reconnect and restores their role and current phase. If the host disconnects, another connected player automatically becomes host so the room can continue.'}</li>
                <li>{lang === 'el' ? 'Στο τέλος εμφανίζεται ο νικητής, οι ρόλοι και MVP βάσει των σωστών ψήφων στους δολοφόνους.' : 'At the end, the winner, all roles, and an MVP based on successful killer votes are shown.'}</li>
              </ul>
            </div>

            <div className="howToSection">
              <h3>{lang === 'el' ? 'ΕΠΙΚΟΙΝΩΝΙΑ' : 'COMMUNICATION'}</h3>
              <p>{lang === 'el'
                ? 'Το Palermo δεν χρησιμοποιεί ενσωματωμένο voice chat. Κατά τη συζήτηση οι ζωντανοί παίκτες μπορούν να γράφουν στο text chat του παιχνιδιού ή, αν το συμφωνήσει η παρέα, να μιλούν μέσω Discord ή άλλης εξωτερικής εφαρμογής. Οι νεκροί και οι θεατές δεν πρέπει να επικοινωνούν με τους ζωντανούς.'
                : 'Palermo does not use built-in voice chat. During discussion, living players can use the in-game text chat or, if the group agrees, talk through Discord or another external voice app. Dead players and spectators must not communicate with living players.'}</p>
            </div>

            <button className="primary wide" onClick={() => setHowToOpen(false)}>
              {lang === 'el' ? 'ΚΑΤΑΛΑΒΑ' : 'GOT IT'}
            </button>
          </div>
        </div>
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
