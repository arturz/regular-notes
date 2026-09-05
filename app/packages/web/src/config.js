// Regular Notes runtime config (loaded via <script> before the bundle, no rebuild needed).
window.defaultSyncServer = window.location.origin
window.defaultFilesHost = window.location.origin
window.enabledUnfinishedFeatures = false
window.websocketUrl = ''
// Official purchase page: the client appends /offline for the self-host legal path
// (Preferences > General > Offline activation). Keep it to support upstream.
window.purchaseUrl = 'https://standardnotes.com'
window.plansUrl = ''
window.dashboardUrl = ''
// Corresponding-source offer (AGPL) shown in the footer when set, e.g. your public fork URL.
window.sourceCodeUrl = ''
