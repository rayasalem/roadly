export type Locale = 'en' | 'ar';

export type StringKey =
  | 'app.name'
  | 'home.greeting'
  | 'home.subtitle'
  | 'home.servicesTitle'
  | 'home.servicesSubtitle'
  | 'home.services.mechanic.title'
  | 'home.services.mechanic.subtitle'
  | 'home.services.mechanic.meta'
  | 'home.services.tow.title'
  | 'home.services.tow.subtitle'
  | 'home.services.tow.meta'
  | 'home.services.rental.title'
  | 'home.services.rental.subtitle'
  | 'home.services.rental.meta'
  | 'home.languageToggle'
  | 'auth.login.title'
  | 'auth.login.cta'
  | 'auth.login.placeholder.email'
  | 'auth.login.placeholder.password'
  | 'common.notImplemented'
  | 'common.loading'
  | 'common.error'
  | 'home.title'
  | 'home.welcome'
  | 'error.network'
  | 'error.timeout'
  | 'error.server'
  | 'error.unknown'
  | 'home.toastExample'
  | 'home.action.toast'
  | 'home.action.loader'
  | 'home.action.openMap'
  | 'common.ok'
  | 'common.cancel'
  | 'common.retry'
  | 'common.ok'
  | 'errors.unknown'
  | 'auth.saved.title'
  | 'auth.saved.lastLogin'
  | 'auth.saved.lastRegister'
  | 'auth.register.title'
  | 'auth.register.cta'
  | 'auth.register.placeholder.name'
  | 'auth.welcome.subtitle'
  | 'auth.login.subtitle'
  | 'auth.register.subtitle'
  | 'auth.login.forgot'
  | 'auth.noAccount'
  | 'auth.hasAccount'
  | 'auth.error.required'
  | 'auth.error.requiredAll'
  | 'auth.error.generic'
  | 'auth.logout'
  | 'auth.login.success'
  | 'auth.register.success'
  | 'profile.title'
  | 'profile.name'
  | 'profile.email'
  | 'profile.role'
  | 'profile.myServices'
  | 'profile.addService'
  | 'profile.removeService'
  | 'profile.rating'
  | 'profile.status'
  | 'request.title'
  | 'request.subtitle'
  | 'request.serviceType'
  | 'request.createCta'
  | 'request.invalidParams'
  | 'request.currentTitle'
  | 'request.none'
  | 'request.creating'
  | 'request.loading'
  | 'request.status'
  | 'request.historyTitle'
  | 'request.noHistory'
  | 'request.status.pending'
  | 'request.status.accepted'
  | 'request.status.on_the_way'
  | 'request.status.completed'
  | 'request.status.cancelled'
  | 'request.eta'
  | 'request.etaMinutes'
  | 'request.trackBelow'
  | 'request.sentTitle'
  | 'request.types.mechanic'
  | 'request.types.tow'
  | 'request.types.rental'
  | 'request.types.battery'
  | 'request.types.tire'
  | 'request.types.oil_change'
  | 'request.location'
  | 'request.preferredTime'
  | 'request.preferredTimePlaceholder'
  | 'request.nearestProvider'
  | 'request.confirmRequest'
  | 'request.requestNow'
  | 'request.locationRequired'
  | 'request.serviceTypeFilterPlaceholder'
  | 'common.optional'
  | 'request.apiUnavailable'
  | 'request.confirmationTitle'
  | 'request.serviceDescription'
  | 'request.serviceDescriptionPlaceholder'
  | 'request.suggestedProviders'
  | 'services.battery'
  | 'services.tire'
  | 'services.oilChange'
  | 'common.currency'
  | 'request.submitRating'
  | 'request.ratingSubmitted'
  | 'map.title'
  | 'map.incomingRequests'
  | 'map.nearest'
  | 'map.noProviders'
  | 'map.cta.start'
  | 'auth.getStarted'
  | 'auth.tagline'
  | 'splash.tagline1'
  | 'splash.tagline2'
  | 'splash.tagline3'
  | 'splash.tagline4'
  | 'onboarding.mechanic.title'
  | 'onboarding.mechanic.subtitle'
  | 'onboarding.tow.title'
  | 'onboarding.tow.subtitle'
  | 'onboarding.rental.title'
  | 'onboarding.rental.subtitle'
  | 'onboarding.cta.next'
  | 'onboarding.cta.skip'
  | 'onboarding.cta.getStarted'
  | 'welcome.headline'
  | 'welcome.subtitle'
  | 'welcome.signUp'
  | 'welcome.login'
  | 'welcome.continueAsGuest'
  | 'nav.home'
  | 'nav.chat'
  | 'chat.placeholder'
  | 'nav.notifications'
  | 'notifications.justNow'
  | 'notifications.minAgo'
  | 'notifications.hoursAgo'
  | 'notifications.yesterday'
  | 'notifications.empty'
  | 'nav.profile'
  | 'nav.settings'
  | 'settings.appearance'
  | 'customer.liveTracking'
  | 'customer.liveTrackingTitle'
  | 'customer.liveTrackingSubtitle'
  | 'customer.ratings'
  | 'customer.ratingsEmpty'
  | 'customer.ratingsEmptySubtitle'
  | 'customer.payment'
  | 'customer.addPaymentMethod'
  | 'customer.paymentHint'
  | 'customer.favorites'
  | 'customer.favoritesEmpty'
  | 'customer.favoritesEmptySubtitle'
  | 'customer.helpSupport'
  | 'customer.faq'
  | 'customer.contactUs'
  | 'tow.requests'
  | 'tow.jobHistory'
  | 'tow.settings'
  | 'rental.carList'
  | 'rental.bookings'
  | 'rental.history'
  | 'rental.settings'
  | 'admin.reports'
  | 'admin.systemSettings'
  | 'home.startJourney'
  | 'home.pickupPlaceholder'
  | 'home.destinationPlaceholder'
  | 'home.nearestLocations'
  | 'home.savedPlaces'
  | 'home.nearbyRiders'
  | 'auth.welcomeHeadline'
  | 'auth.signIn'
  | 'auth.createAccount'
  | 'auth.welcomeBack'
  | 'auth.loginToAccount'
  | 'auth.createNewAccount'
  | 'auth.rememberMe'
  | 'auth.orContinueWith'
  | 'auth.signUp'
  | 'mechanic.dashboard.title'
  | 'tow.dashboard.title'
  | 'rental.dashboard.title'
  | 'map.filter.all'
  | 'map.filter.mechanic'
  | 'map.filter.tow'
  | 'map.filter.rental'
  | 'map.legend.available'
  | 'map.legend.busy'
  | 'map.legend.offline'
  | 'map.legend.you'
  | 'map.searchPlaceholder'
  | 'map.searchHerePlaceholder'
  | 'map.useCurrentLocation'
  | 'map.requestService'
  | 'map.createRequest'
  | 'map.onlyCustomersCanRequest'
  | 'map.backToList'
  | 'map.myLocation'
  | 'map.placeholderNoKey'
  | 'map.placeholderLoadError'
  | 'map.openMap'
  | 'map.status.available'
  | 'map.status.busy'
  | 'map.status.onTheWay'
  | 'map.status.offline'
  | 'map.viewProfile'
  | 'map.ratingStars'
  | 'map.locationDeniedTitle'
  | 'map.locationDeniedMessage'
  | 'map.locationEnableInstructions'
  | 'map.noProvidersSubtitle'
  | 'map.noRequestsYet'
  | 'map.noRequestsSubtitle'
  | 'map.openSettings'
  | 'map.loadingProviders'
  | 'map.showingCachedData'
  | 'map.gettingLocation'
  | 'mechanic.stats.jobsToday'
  | 'mechanic.stats.onTheWay'
  | 'mechanic.stats.rating'
  | 'mechanic.activeRequests'
  | 'mechanic.accept'
  | 'mechanic.decline'
  | 'mechanic.filterAll'
  | 'mechanic.filterNew'
  | 'mechanic.filterOnTheWay'
  | 'mechanic.filterInGarage'
  | 'tow.stats.active'
  | 'tow.stats.waiting'
  | 'tow.stats.fleet'
  | 'tow.todayJobs'
  | 'tow.filterAll'
  | 'tow.filterActive'
  | 'tow.filterQueued'
  | 'tow.requestStatus'
  | 'tow.timeline.requested'
  | 'tow.timeline.assigned'
  | 'tow.timeline.onWay'
  | 'tow.timeline.completed'
  | 'rental.stats.total'
  | 'rental.stats.available'
  | 'rental.stats.rented'
  | 'rental.fleetOverview'
  | 'rental.upcomingBookings'
  | 'rental.available'
  | 'rental.rented'
  | 'rental.maintenance'
  | 'rental.reserved'
  | 'rental.bookNow'
  | 'rental.bookingStarted'
  | 'admin.dashboard.title'
  | 'admin.stats.users'
  | 'admin.stats.providers'
  | 'admin.stats.requests'
  | 'admin.stats.revenue'
  | 'admin.stats.activeProviders'
  | 'admin.stats.activeRequests'
  | 'admin.stats.completedServices'
  | 'admin.section.mechanics'
  | 'admin.section.tow'
  | 'admin.section.rental'
  | 'admin.section.providerList'
  | 'admin.viewList'
  | 'mechanic.whoRequestedMe'
  | 'mechanic.myServices'
  | 'mechanic.mySkills'
  | 'tow.whoRequestedMe'
  | 'tow.myServices'
  | 'tow.mySkills'
  | 'rental.whoRequestedMe'
  | 'rental.myServices'
  | 'rental.mySkills'
  | 'admin.edit'
  | 'admin.addVehicle'
  | 'admin.updateStatus'
  | 'admin.requestsAssigned'
  | 'admin.towingRequests'
  | 'admin.fleetVehicles'
  | 'admin.activeRequests'
  | 'admin.manageUsers'
  | 'admin.usersList'
  | 'admin.editServices'
  | 'admin.assignedServices'
  | 'admin.save'
  | 'admin.saved'
  | 'admin.cancel'
  | 'admin.block'
  | 'admin.unblock'
  | 'admin.userBlocked'
  | 'admin.userUnblocked'
  | 'admin.searchUsers'
  | 'admin.filterAll'
  | 'admin.verify'
  | 'admin.verified'
  | 'admin.userName'
  | 'admin.userRole'
  | 'admin.userStatus'
  | 'admin.servicesMechanic'
  | 'admin.servicesTow'
  | 'admin.servicesRental'
  | 'request.createdSuccess'
  | 'request.statusUpdated'
  | 'request.trackBelow'
  | 'map.requestHint'
  | 'map.call'
  | 'map.chat'
  | 'map.noPhone'
  | 'profile.servicesSaved'
  | 'mechanic.accepted'
  | 'mechanic.declined'
  | 'mechanic.complete'
  | 'mechanic.completed'
  | 'mechanic.navigate'
  | 'mechanic.noJobs'
  | 'mechanic.jobHistory'
  | 'mechanic.noJobHistory'
  | 'tow.noJobs'
  | 'tow.declined'
  | 'tow.accepted'
  | 'rental.noVehicles'
  | 'home.requestHelpNow'
  | 'request.confirmHint'
  | 'request.sentTitle'
  | 'map.confirmOnNextScreen'
  | 'auth.emailInvalid';

export const STRINGS: Record<Locale, Record<StringKey, string>> = {
  en: {
    'app.name': 'Roadly',
    'home.greeting': 'Welcome to Roadly',
    'home.subtitle': 'Choose a service to get started.',
    'home.servicesTitle': 'Services',
    'home.servicesSubtitle': 'On-demand help for your car.',
    'home.services.mechanic.title': 'Mechanic',
    'home.services.mechanic.subtitle': 'Nearest roadside mechanic.',
    'home.services.mechanic.meta': '24 providers nearby',
    'home.services.tow.title': 'Tow / Road assistance',
    'home.services.tow.subtitle': 'Tow truck and roadside help.',
    'home.services.tow.meta': '8 tow trucks online',
    'home.services.rental.title': 'Car rental',
    'home.services.rental.subtitle': 'Find nearby rental cars.',
    'home.services.rental.meta': '12 cars available today',
    'home.languageToggle': 'عربي',
    'auth.login.title': 'Sign in',
    'auth.login.cta': 'Continue',
    'auth.login.placeholder.email': 'email@example.com',
    'auth.login.placeholder.password': 'Password',
    'common.notImplemented': 'Not implemented yet.',
    'common.loading': 'Loading…',
    'common.error': 'Something went wrong.',
    'home.title': 'Home',
    'home.welcome': 'Home',
    'error.network': 'Network error. Please check your internet connection or try again in a moment.',
    'error.timeout': 'Request timed out.',
    'error.server': 'Server error. Try again later.',
    'error.unknown': 'Something went wrong.',
    'home.toastExample': 'Global toast is working.',
    'home.action.toast': 'Show toast',
    'home.action.loader': 'Show loader',
    'home.action.openMap': 'Open map',
    'common.ok': 'OK',
    'common.cancel': 'Cancel',
    'common.retry': 'Retry',
    'common.ok': 'OK',
    'errors.unknown': 'Something went wrong. Please try again.',
    'auth.saved.title': 'Your saved info',
    'auth.saved.lastLogin': 'Last sign-in',
    'auth.saved.lastRegister': 'Last registration',
    'auth.register.title': 'Create account',
    'auth.register.cta': 'Register',
    'auth.register.placeholder.name': 'Full name',
    'auth.welcome.subtitle': 'Find mechanics, tow trucks, and rentals near you.',
    'auth.login.subtitle': 'Use your account to continue.',
    'auth.register.subtitle': 'Create an account to get started.',
    'auth.login.forgot': 'Forgot password?',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.error.required': 'Please enter email and password.',
    'auth.error.requiredAll': 'Please fill in all fields.',
    'auth.error.generic': 'Something went wrong. Please try again.',
    'auth.login.success': 'Welcome back!',
    'auth.register.success': 'Account created successfully.',
    'auth.logout': 'Log out',
    'profile.title': 'Profile',
    'profile.name': 'Name',
    'profile.email': 'Email',
    'profile.role': 'Role',
    'profile.myServices': 'My services',
    'profile.addService': 'Add service',
    'profile.removeService': 'Remove',
    'profile.rating': 'Rating',
    'profile.status': 'Status',
    'request.title': 'Service request',
    'request.subtitle': 'Confirm your request and track its status.',
    'request.serviceType': 'Service type',
    'request.createCta': 'Create request',
    'request.invalidParams': 'Invalid request. Missing or invalid service type.',
    'request.currentTitle': 'Current request',
    'request.none': 'No active request. Create one to get help.',
    'request.creating': 'Creating request…',
    'request.loading': 'Loading request status…',
    'request.status': 'Status',
    'request.historyTitle': 'My requests',
    'request.noHistory': 'No requests yet. Create one from the map.',
    'request.status.pending': 'Pending',
    'request.status.accepted': 'Accepted',
    'request.status.on_the_way': 'On the way',
    'request.status.completed': 'Completed',
    'request.status.cancelled': 'Cancel',
    'request.eta': 'ETA',
    'request.etaMinutes': 'min',
    'request.trackBelow': 'Track your request below.',
    'request.sentTitle': 'Request sent.',
    'request.types.mechanic': 'Mechanic',
    'request.types.tow': 'Tow',
    'request.types.rental': 'Rental',
    'request.types.battery': 'Battery',
    'request.types.tire': 'Tire',
    'request.types.oil_change': 'Oil change',
    'request.location': 'Location',
    'request.preferredTime': 'Preferred time',
    'request.preferredTimePlaceholder': 'e.g. ASAP or 2:00 PM',
    'request.nearestProvider': 'Nearest provider',
    'request.confirmRequest': 'Confirm request',
    'request.requestNow': 'Request Now',
    'request.locationRequired': 'Location is required to create a request.',
    'request.serviceTypeFilterPlaceholder': 'Filter service type…',
    'common.optional': 'optional',
    'request.apiUnavailable': 'Service temporarily unavailable. Using cached providers.',
    'request.confirmationTitle': 'Request sent',
    'request.serviceDescription': 'Service description',
    'request.serviceDescriptionPlaceholder': 'e.g. flat tire, battery jump',
    'request.suggestedProviders': 'Suggested providers (nearest first)',
    'services.battery': 'Battery service',
    'services.tire': 'Tire service',
    'services.oilChange': 'Oil change',
    'common.currency': 'USD',
    'request.submitRating': 'Submit rating',
    'request.ratingSubmitted': 'Thank you for your rating!',
    'map.title': 'Get direction',
    'map.incomingRequests': 'Incoming requests',
    'map.nearest': 'Nearest provider',
    'map.noProviders': 'No providers nearby yet.',
    'map.noRequestsYet': 'No requests yet.',
    'map.noRequestsSubtitle': 'New service requests will appear here.',
    'map.cta.start': 'Start',
    'auth.getStarted': 'Get Started',
    'auth.tagline': 'Rent Your Vehicle & Earn Some Extra Money.',
    'splash.tagline1': "Your car's best friend, anytime, anywhere!",
    'splash.tagline2': 'Fast. Reliable. On-demand car services.',
    'splash.tagline3': "From a tow to a tune-up, we've got you covered.",
    'splash.tagline4': 'One tap. Real help. Every time.',
    'onboarding.mechanic.title': 'Find skilled mechanics instantly, wherever you are!',
    'onboarding.mechanic.subtitle': 'Car trouble? We bring the experts to your door!',
    'onboarding.tow.title': 'Stranded? A tow truck is just a tap away!',
    'onboarding.tow.subtitle': 'Quick, safe, and reliable roadside assistance.',
    'onboarding.rental.title': 'Need a car? Rent with ease in minutes!',
    'onboarding.rental.subtitle': 'Choose your ride and get moving instantly.',
    'onboarding.cta.next': 'Next',
    'onboarding.cta.skip': 'Skip',
    'onboarding.cta.getStarted': 'Get Started',
    'welcome.headline': 'Join thousands of drivers and car owners today!',
    'welcome.subtitle': 'Fast, easy, and secure car services at your fingertips.',
    'welcome.signUp': 'Sign Up',
    'welcome.login': 'Login',
    'welcome.continueAsGuest': 'Continue as Guest',
    'nav.home': 'Home',
    'nav.chat': 'Chat',
    'chat.placeholder': 'Type a message…',
    'nav.notifications': 'Notifications',
    'notifications.justNow': 'Just now',
    'notifications.minAgo': 'min ago',
    'notifications.hoursAgo': 'hours ago',
    'notifications.yesterday': 'Yesterday',
    'notifications.empty': 'No notifications yet.',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'customer.liveTracking': 'Live Tracking',
    'customer.liveTrackingTitle': 'Track your provider',
    'customer.liveTrackingSubtitle': 'See ETA and open the map to follow the journey.',
    'customer.ratings': 'Ratings',
    'customer.ratingsEmpty': 'No ratings yet',
    'customer.ratingsEmptySubtitle': 'Rate your completed services from Request History.',
    'customer.payment': 'Payment',
    'customer.addPaymentMethod': 'Add payment method',
    'customer.paymentHint': 'Add a card to pay for services quickly.',
    'customer.favorites': 'Favorites',
    'customer.favoritesEmpty': 'No favorites yet',
    'customer.favoritesEmptySubtitle': 'Save providers from the map to request them faster.',
    'customer.helpSupport': 'Help & Support',
    'customer.faq': 'FAQ',
    'customer.contactUs': 'Contact us',
    'tow.requests': 'Requests',
    'tow.jobHistory': 'Job history',
    'tow.settings': 'Settings',
    'rental.carList': 'Car list',
    'rental.bookings': 'Bookings',
    'rental.history': 'Rental history',
    'rental.settings': 'Settings',
    'admin.reports': 'Reports',
    'admin.systemSettings': 'System settings',
    'settings.appearance': 'Appearance',
    'home.startJourney': 'Start Your Journey',
    'home.pickupPlaceholder': 'Choose Pickup Point',
    'home.destinationPlaceholder': 'Choose Destination',
    'home.nearestLocations': 'Nearest Locations',
    'home.savedPlaces': 'Saved Places',
    'home.nearbyRiders': 'Nearby Riders',
    'mechanic.dashboard.title': 'Mechanic dashboard',
    'tow.dashboard.title': 'Tow dashboard',
    'rental.dashboard.title': 'Rental dashboard',
    'map.filter.all': 'All',
    'map.filter.mechanic': 'Mechanics',
    'map.filter.tow': 'Tow Trucks',
    'map.filter.rental': 'Car Rentals',
    'map.legend.available': 'Available',
    'map.legend.busy': 'Busy',
    'map.legend.offline': 'Offline',
    'map.legend.you': 'You',
    'map.searchPlaceholder': 'Search area or address',
    'map.searchHerePlaceholder': 'Search here or enter address and area',
    'map.useCurrentLocation': 'Use current location',
    'map.requestService': 'Request service',
    'map.createRequest': 'Create request',
    'map.onlyCustomersCanRequest': 'Only customers can request services',
    'map.backToList': 'Back to list',
    'map.myLocation': 'My location',
    'map.placeholderNoKey': 'Add EXPO_PUBLIC_GOOGLE_MAPS_KEY in .env to show the map',
    'map.placeholderLoadError': 'Map could not load. Check your key and connection.',
    'map.openMap': 'Open map',
    'map.status.available': 'Available',
    'map.status.busy': 'Busy',
    'map.status.onTheWay': 'On the way',
    'map.status.offline': 'Offline',
    'map.viewProfile': 'View Profile',
    'map.ratingStars': 'Stars',
    'map.locationDeniedTitle': 'Location access needed',
    'map.locationDeniedMessage': 'To show nearby providers and your position on the map, please allow location access.',
    'map.locationEnableInstructions': 'Open Settings → Roadly → Location → set to "While Using" or "Always". Then return here and tap Try again.',
    'map.noProvidersSubtitle': 'Try again in a moment or change filters to see more options.',
    'map.openSettings': 'Open Settings',
    'map.loadingProviders': 'Loading providers…',
    'map.gettingLocation': 'Getting your location…',
    'mechanic.stats.jobsToday': 'Jobs today',
    'mechanic.stats.onTheWay': 'On the way',
    'mechanic.stats.rating': 'Rating',
    'mechanic.activeRequests': 'Active requests',
    'mechanic.accept': 'Accept',
    'mechanic.decline': 'Decline',
    'mechanic.filterAll': 'All',
    'mechanic.filterNew': 'New',
    'mechanic.filterOnTheWay': 'On the way',
    'mechanic.filterInGarage': 'In garage',
    'tow.stats.active': 'Active tows',
    'tow.stats.waiting': 'Waiting',
    'tow.stats.fleet': 'Fleet size',
    'tow.todayJobs': "Today's tow jobs",
    'tow.filterAll': 'All',
    'tow.filterActive': 'Active',
    'tow.filterQueued': 'Queued',
    'tow.requestStatus': 'Request status',
    'tow.timeline.requested': 'Requested',
    'tow.timeline.assigned': 'Assigned',
    'tow.timeline.onWay': 'On the way',
    'tow.timeline.completed': 'Completed',
    'rental.stats.total': 'Cars total',
    'rental.stats.available': 'Available',
    'rental.stats.rented': 'Rented',
    'rental.fleetOverview': 'Fleet overview',
    'rental.upcomingBookings': 'Upcoming bookings',
    'rental.available': 'Available',
    'rental.rented': 'Rented',
    'rental.maintenance': 'Maintenance',
    'rental.reserved': 'Reserved',
    'rental.bookNow': 'Book now',
    'rental.bookingStarted': 'Booking started. Confirm on next step.',
    'admin.dashboard.title': 'Admin dashboard',
    'admin.stats.users': 'Users',
    'admin.stats.providers': 'Providers',
    'admin.stats.requests': 'Requests',
    'admin.stats.revenue': 'Revenue',
    'admin.stats.activeProviders': 'Active providers',
    'admin.stats.activeRequests': 'Active requests',
    'admin.stats.completedServices': 'Completed',
    'admin.section.mechanics': 'Mechanics',
    'admin.section.tow': 'Tow',
    'admin.section.rental': 'Car rental',
    'admin.section.providerList': 'Provider list',
    'admin.viewList': 'View list',
    'mechanic.whoRequestedMe': 'Who requested me',
    'mechanic.myServices': 'My services',
    'mechanic.mySkills': 'My skills',
    'tow.whoRequestedMe': 'Who requested me',
    'tow.myServices': 'My services',
    'tow.mySkills': 'My skills',
    'rental.whoRequestedMe': 'Who requested me',
    'rental.myServices': 'My services',
    'rental.mySkills': 'My skills',
    'admin.edit': 'Edit',
    'admin.addVehicle': 'Add vehicle',
    'admin.updateStatus': 'Update status',
    'admin.requestsAssigned': 'Requests assigned',
    'admin.towingRequests': 'Towing requests',
    'admin.fleetVehicles': 'Fleet vehicles',
    'admin.activeRequests': 'Active requests',
    'admin.manageUsers': 'Manage users',
    'admin.usersList': 'Users',
    'admin.editServices': 'Edit services',
    'admin.assignedServices': 'Assigned services',
    'admin.save': 'Save',
    'admin.saved': 'Saved successfully.',
    'admin.cancel': 'Cancel',
    'admin.block': 'Block',
    'admin.unblock': 'Unblock',
    'admin.userBlocked': 'User blocked.',
    'admin.userUnblocked': 'User unblocked.',
    'admin.searchUsers': 'Search users…',
    'admin.filterAll': 'All',
    'admin.verify': 'Verify',
    'admin.verified': 'Provider verified.',
    'admin.userName': 'Name',
    'admin.userRole': 'Role',
    'admin.userStatus': 'Status',
    'admin.servicesMechanic': 'Mechanic services',
    'admin.servicesTow': 'Tow services',
    'admin.servicesRental': 'Rental services',
    'request.createdSuccess': 'Request sent. A provider will be notified.',
    'request.statusUpdated': 'Status updated.',
    'request.trackBelow': 'Track your request status below.',
    'map.requestHint': 'Tap Request service to confirm and get help.',
    'map.call': 'Call',
    'map.chat': 'Chat',
    'map.noPhone': 'No phone number available.',
    'profile.servicesSaved': 'Services updated.',
    'mechanic.accepted': 'Request accepted.',
    'mechanic.declined': 'Request declined.',
    'mechanic.complete': 'Complete',
    'mechanic.completed': 'Service completed.',
    'mechanic.navigate': 'Navigate',
    'mechanic.noJobs': 'No jobs yet. New requests will appear here when customers need help.',
    'mechanic.jobHistory': 'Job history',
    'mechanic.noJobHistory': 'No completed jobs yet.',
    'mechanic.availability': 'Availability',
    'mechanic.unavailable': 'Offline',
    'tow.noJobs': 'No tow jobs yet. New requests will appear here.',
    'tow.declined': 'Request declined.',
    'tow.accepted': 'Request accepted.',
    'rental.noVehicles': 'No vehicles listed yet. Add vehicles or wait for bookings.',
    'home.requestHelpNow': 'Request help now',
    'request.confirmHint': 'Tap the button below to send your request. A provider will be notified.',
    'request.sentTitle': 'Request sent',
    'map.confirmOnNextScreen': 'Confirm and send your request on the next screen.',
    'auth.emailInvalid': 'Please enter a valid email address.',
  },
  ar: {
    'app.name': 'Roadly',
    'home.greeting': 'أهلاً بك في Roadly',
    'home.subtitle': 'اختر الخدمة للبدء الآن.',
    'home.servicesTitle': 'الخدمات',
    'home.servicesSubtitle': 'مساعدة فورية لسيارتك.',
    'home.services.mechanic.title': 'ميكانيكي',
    'home.services.mechanic.subtitle': 'أقرب ميكانيكي على الطريق.',
    'home.services.mechanic.meta': '24 مزوداً قريباً',
    'home.services.tow.title': 'ونش / مساعدة طريق',
    'home.services.tow.subtitle': 'سيارات سحب ومساعدة على الطريق.',
    'home.services.tow.meta': '8 سيارات ونش متاحة',
    'home.services.rental.title': 'تأجير سيارات',
    'home.services.rental.subtitle': 'ابحث عن مكاتب تأجير قريبة.',
    'home.services.rental.meta': '12 سيارة متاحة اليوم',
    'home.languageToggle': 'EN',
    'auth.login.title': 'تسجيل الدخول',
    'auth.login.cta': 'متابعة',
    'auth.login.placeholder.email': 'email@example.com',
    'auth.login.placeholder.password': 'كلمة المرور',
    'common.notImplemented': 'غير متوفر حالياً.',
    'common.loading': 'جاري التحميل…',
    'common.error': 'حدث خطأ.',
    'home.title': 'الرئيسية',
    'home.welcome': 'الرئيسية',
    'error.network': 'خطأ في الشبكة. يرجى التحقق من اتصال الإنترنت أو المحاولة مرة أخرى بعد قليل.',
    'error.timeout': 'انتهت مهلة الطلب.',
    'error.server': 'خطأ في الخادم. حاول لاحقاً.',
    'error.unknown': 'حدث خطأ ما.',
    'home.toastExample': 'نظام التنبيهات يعمل.',
    'home.action.toast': 'إظهار تنبيه',
    'home.action.loader': 'إظهار تحميل',
    'home.action.openMap': 'الخريطة',
    'common.ok': 'حسناً',
    'common.cancel': 'إلغاء',
    'common.retry': 'إعادة المحاولة',
    'common.ok': 'موافق',
    'errors.unknown': 'حدث خطأ. جرّب مرة أخرى.',
    'auth.saved.title': 'معلوماتك المحفوظة',
    'auth.saved.lastLogin': 'آخر تسجيل دخول',
    'auth.saved.lastRegister': 'آخر تسجيل',
    'auth.register.title': 'إنشاء حساب',
    'auth.register.cta': 'تسجيل',
    'auth.register.placeholder.name': 'الاسم الكامل',
    'auth.welcome.subtitle': 'ابحث عن ميكانيكي وونش وتأجير سيارات قريب منك.',
    'auth.login.subtitle': 'استخدم حسابك للمتابعة.',
    'auth.register.subtitle': 'أنشئ حساباً للبدء.',
    'auth.login.forgot': 'نسيت كلمة المرور؟',
    'auth.noAccount': 'ليس لديك حساب؟',
    'auth.hasAccount': 'لديك حساب بالفعل؟',
    'auth.error.required': 'يرجى إدخال البريد وكلمة المرور.',
    'auth.error.requiredAll': 'يرجى تعبئة جميع الحقول.',
    'auth.error.generic': 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    'auth.login.success': 'تم تسجيل الدخول بنجاح.',
    'auth.register.success': 'تم إنشاء الحساب بنجاح.',
    'auth.logout': 'تسجيل الخروج',
    'profile.title': 'الملف الشخصي',
    'profile.name': 'الاسم',
    'profile.email': 'البريد الإلكتروني',
    'profile.role': 'الدور',
    'profile.myServices': 'خدماتي',
    'profile.addService': 'إضافة خدمة',
    'profile.removeService': 'إزالة',
    'profile.rating': 'التقييم',
    'profile.status': 'الحالة',
    'request.title': 'طلب خدمة',
    'request.subtitle': 'أكد طلبك وتتبع حالته.',
    'request.serviceType': 'نوع الخدمة',
    'request.createCta': 'إنشاء طلب',
    'request.invalidParams': 'طلب غير صالح. نوع الخدمة مفقود أو غير صحيح.',
    'request.currentTitle': 'الطلب الحالي',
    'request.none': 'لا يوجد طلب نشط. أنشئ طلباً للحصول على المساعدة.',
    'request.creating': 'جاري إنشاء الطلب…',
    'request.loading': 'جاري تحميل حالة الطلب…',
    'request.status': 'الحالة',
    'request.historyTitle': 'طلباتي',
    'request.noHistory': 'لا توجد طلبات بعد. أنشئ طلباً من الخريطة.',
    'request.status.pending': 'قيد الانتظار',
    'request.status.accepted': 'مقبول',
    'request.status.on_the_way': 'في الطريق',
    'request.status.completed': 'مكتمل',
    'request.status.cancelled': 'إلغاء',
    'request.eta': 'الوصول المتوقع',
    'request.etaMinutes': 'د',
    'request.trackBelow': 'تتبع طلبك أدناه.',
    'request.sentTitle': 'تم إرسال الطلب.',
    'request.types.mechanic': 'ميكانيكي',
    'request.types.tow': 'ونش',
    'request.types.rental': 'تأجير',
    'request.types.battery': 'بطارية',
    'request.types.tire': 'إطارات',
    'request.types.oil_change': 'تغيير زيت',
    'request.location': 'الموقع',
    'request.preferredTime': 'الوقت المفضل',
    'request.preferredTimePlaceholder': 'مثلاً: في أقرب وقت أو ٢:٠٠ م',
    'request.nearestProvider': 'أقرب مزود',
    'request.confirmRequest': 'تأكيد الطلب',
    'request.requestNow': 'اطلب الآن',
    'request.locationRequired': 'الموقع مطلوب لإنشاء الطلب.',
    'request.serviceTypeFilterPlaceholder': 'تصفية نوع الخدمة…',
    'common.optional': 'اختياري',
    'request.apiUnavailable': 'الخدمة غير متاحة مؤقتاً. جارٍ استخدام قائمة مخزنة.',
    'request.confirmationTitle': 'تم إرسال الطلب',
    'request.serviceDescription': 'وصف الخدمة',
    'request.serviceDescriptionPlaceholder': 'مثلاً: إطار مفلوق، شحن بطارية',
    'request.suggestedProviders': 'مقترح المزودين (الأقرب أولاً)',
    'services.battery': 'خدمة البطارية',
    'services.tire': 'خدمة الإطارات',
    'services.oilChange': 'تغيير الزيت',
    'common.currency': 'USD',
    'request.submitRating': 'إرسال التقييم',
    'request.ratingSubmitted': 'شكراً لتقييمك!',
    'map.title': 'الحصول على الاتجاه',
    'map.incomingRequests': 'الطلبات الواردة',
    'map.nearest': 'أقرب مزود',
    'map.noProviders': 'لا يوجد مزودون قريبون بعد.',
    'map.cta.start': 'ابدأ',
    'auth.getStarted': 'ابدأ',
    'auth.tagline': 'أجر سيارتك واكسب مالاً إضافياً.',
    'splash.tagline1': 'أفضل صديق لسيارتك، في أي وقت وأي مكان!',
    'splash.tagline2': 'سريع. موثوق. خدمات سيارات عند الطلب.',
    'splash.tagline3': 'من السحب إلى الصيانة، نحن معك.',
    'splash.tagline4': 'ضغطة واحدة. مساعدة حقيقية. كل مرة.',
    'onboarding.mechanic.title': 'اعثر على ميكانيكيين مهرة فوراً، أينما كنت!',
    'onboarding.mechanic.subtitle': 'مشكلة في السيارة؟ نُحضر الخبراء إلى بابك!',
    'onboarding.tow.title': 'علقت؟ ونش على بُعد ضغطة واحدة!',
    'onboarding.tow.subtitle': 'مساعدة طرق سريعة وآمنة وموثوقة.',
    'onboarding.rental.title': 'تحتاج سيارة؟ استأجر بسهولة خلال دقائق!',
    'onboarding.rental.subtitle': 'اختر سيارتك وانطلق فوراً.',
    'onboarding.cta.next': 'التالي',
    'onboarding.cta.skip': 'تخطي',
    'onboarding.cta.getStarted': 'ابدأ الآن',
    'welcome.headline': 'انضم إلى آلاف السائقين وأصحاب السيارات اليوم!',
    'welcome.subtitle': 'خدمات سيارات سريعة وسهلة وآمنة بين يديك.',
    'welcome.signUp': 'إنشاء حساب',
    'welcome.login': 'تسجيل الدخول',
    'welcome.continueAsGuest': 'متابعة كزائر',
    'nav.home': 'الرئيسية',
    'nav.chat': 'الدردشة',
    'chat.placeholder': 'اكتب رسالة…',
    'nav.notifications': 'الإشعارات',
    'notifications.justNow': 'الآن',
    'notifications.minAgo': 'دقيقة',
    'notifications.hoursAgo': 'ساعات',
    'notifications.yesterday': 'أمس',
    'notifications.empty': 'لا توجد إشعارات بعد.',
    'nav.profile': 'الملف',
    'nav.settings': 'الإعدادات',
    'customer.liveTracking': 'التتبع المباشر',
    'customer.liveTrackingTitle': 'تتبع مزود الخدمة',
    'customer.liveTrackingSubtitle': 'اعرض وقت الوصول وافتح الخريطة لمتابعة الرحلة.',
    'customer.ratings': 'التقييمات',
    'customer.ratingsEmpty': 'لا توجد تقييمات بعد',
    'customer.ratingsEmptySubtitle': 'قيّم الخدمات المكتملة من سجل الطلبات.',
    'customer.payment': 'الدفع',
    'customer.addPaymentMethod': 'إضافة طريقة دفع',
    'customer.paymentHint': 'أضف بطاقة للدفع بسرعة.',
    'customer.favorites': 'المفضلة',
    'customer.favoritesEmpty': 'لا مفضلات بعد',
    'customer.favoritesEmptySubtitle': 'احفظ المزودين من الخريطة لطلبهم بسرعة.',
    'customer.helpSupport': 'المساعدة والدعم',
    'customer.faq': 'الأسئلة الشائعة',
    'customer.contactUs': 'تواصل معنا',
    'tow.requests': 'الطلبات',
    'tow.jobHistory': 'سجل المهام',
    'tow.settings': 'الإعدادات',
    'rental.carList': 'قائمة السيارات',
    'rental.bookings': 'الحجوزات',
    'rental.history': 'سجل التأجير',
    'rental.settings': 'الإعدادات',
    'admin.reports': 'التقارير',
    'admin.systemSettings': 'إعدادات النظام',
    'admin.reportsEmpty': 'صدّر واعرض تقارير الاستخدام من هنا.',
    'admin.systemSettingsHint': 'ضبط الخيارات العامة والإشعارات.',
    'rental.addCar': 'إضافة سيارة',
    'rental.noBookings': 'لا توجد طلبات حجز بعد.',
    'rental.noHistory': 'لا يوجد سجل تأجير بعد.',
    'settings.appearance': 'المظهر',
    'home.startJourney': 'ابدأ رحلتك',
    'home.pickupPlaceholder': 'اختر نقطة الانطلاق',
    'home.destinationPlaceholder': 'اختر الوجهة',
    'home.nearestLocations': 'أقرب المواقع',
    'home.savedPlaces': 'الأماكن المحفوظة',
    'home.nearbyRiders': 'القريبون منك',
    'auth.welcomeHeadline': 'أفضل تطبيق لسيارتك',
    'auth.signIn': 'تسجيل الدخول',
    'auth.createAccount': 'إنشاء حساب',
    'auth.welcomeBack': 'مرحباً بعودتك',
    'auth.loginToAccount': 'سجّل الدخول إلى حسابك',
    'auth.createNewAccount': 'أنشئ حسابك الجديد',
    'auth.rememberMe': 'تذكرني',
    'auth.orContinueWith': 'أو تابع باستخدام',
    'auth.signUp': 'إنشاء حساب',
    'mechanic.dashboard.title': 'لوحة تحكم الميكانيكي',
    'tow.dashboard.title': 'لوحة تحكم الونش',
    'rental.dashboard.title': 'لوحة تحكم التأجير',
    'map.filter.all': 'الكل',
    'map.filter.mechanic': 'ميكانيكيون',
    'map.filter.tow': 'ونش',
    'map.filter.rental': 'تأجير سيارات',
    'map.legend.available': 'متاح',
    'map.legend.busy': 'مشغول',
    'map.legend.offline': 'غير متصل',
    'map.legend.you': 'أنت',
    'map.searchPlaceholder': 'البحث عن منطقة أو عنوان',
    'map.searchHerePlaceholder': 'البحث هنا أو أدخل العنوان والمنطقة',
    'map.useCurrentLocation': 'استخدم موقعي الحالي',
    'map.requestService': 'طلب خدمة',
    'map.createRequest': 'إنشاء طلب',
    'map.onlyCustomersCanRequest': 'يمكن للعملاء فقط طلب الخدمات',
    'map.backToList': 'العودة للقائمة',
    'map.myLocation': 'موقعي',
    'map.placeholderNoKey': 'أضف EXPO_PUBLIC_GOOGLE_MAPS_KEY في .env لعرض الخريطة',
    'map.placeholderLoadError': 'تعذر تحميل الخريطة. تحقق من المفتاح والاتصال.',
    'map.openMap': 'فتح الخريطة',
    'map.status.available': 'متاح',
    'map.status.busy': 'مشغول',
    'map.status.onTheWay': 'في الطريق',
    'map.status.offline': 'غير متصل',
    'map.viewProfile': 'عرض الملف',
    'map.ratingStars': 'نجوم',
    'map.locationDeniedTitle': 'الوصول إلى الموقع مطلوب',
    'map.locationDeniedMessage': 'لعرض مزودي الخدمة القريبين وموقعك على الخريطة، يرجى السماح بالوصول إلى الموقع.',
    'map.locationEnableInstructions': 'افتح الإعدادات → Roadly → الموقع → اختر "أثناء استخدام التطبيق" أو "دائماً". ثم عد هنا واضغط إعادة المحاولة.',
    'map.noProvidersSubtitle': 'حاول مرة أخرى بعد قليل أو غيّر الفلاتر لعرض المزيد.',
    'map.noRequestsYet': 'لا توجد طلبات بعد.',
    'map.noRequestsSubtitle': 'ستظهر طلبات الخدمة الجديدة هنا.',
    'map.openSettings': 'فتح الإعدادات',
    'map.loadingProviders': 'جاري تحميل المزودين…',
    'map.showingCachedData': 'عرض مواقع مزودين من الذاكرة المؤقتة.',
    'map.gettingLocation': 'جاري تحديد موقعك…',
    'mechanic.stats.jobsToday': 'مهام اليوم',
    'mechanic.stats.onTheWay': 'في الطريق',
    'mechanic.stats.rating': 'التقييم',
    'mechanic.activeRequests': 'الطلبات النشطة',
    'mechanic.accept': 'قبول',
    'mechanic.decline': 'رفض',
    'mechanic.filterAll': 'الكل',
    'mechanic.filterNew': 'جديد',
    'mechanic.filterOnTheWay': 'في الطريق',
    'mechanic.filterInGarage': 'في الورشة',
    'tow.stats.active': 'سحوبات نشطة',
    'tow.stats.waiting': 'في الانتظار',
    'tow.stats.fleet': 'حجم الأسطول',
    'tow.todayJobs': 'مهام الونش اليوم',
    'tow.filterAll': 'الكل',
    'tow.filterActive': 'نشط',
    'tow.filterQueued': 'قائمة الانتظار',
    'tow.requestStatus': 'حالة الطلب',
    'tow.timeline.requested': 'تم الطلب',
    'tow.timeline.assigned': 'تم التعيين',
    'tow.timeline.onWay': 'في الطريق',
    'tow.timeline.completed': 'مكتمل',
    'rental.stats.total': 'إجمالي السيارات',
    'rental.stats.available': 'متاحة',
    'rental.stats.rented': 'مؤجرة',
    'rental.fleetOverview': 'نظرة على الأسطول',
    'rental.upcomingBookings': 'الحجوزات القادمة',
    'rental.available': 'متاحة',
    'rental.rented': 'مؤجرة',
    'rental.maintenance': 'صيانة',
    'rental.reserved': 'محجوزة',
    'rental.bookNow': 'احجز الآن',
    'rental.bookingStarted': 'تم بدء الحجز. أكد في الخطوة التالية.',
    'admin.dashboard.title': 'لوحة الأدمن',
    'admin.stats.users': 'المستخدمون',
    'admin.stats.providers': 'مقدمو الخدمة',
    'admin.stats.requests': 'الطلبات',
    'admin.stats.revenue': 'الإيرادات',
    'admin.stats.activeProviders': 'مقدمو خدمة نشطون',
    'admin.stats.activeRequests': 'طلبات نشطة',
    'admin.stats.completedServices': 'مكتملة',
    'admin.section.mechanics': 'الميكانيكيون',
    'admin.section.tow': 'الونش',
    'admin.section.rental': 'مؤجرو السيارات',
    'admin.section.providerList': 'قائمة مقدمي الخدمة',
    'admin.viewList': 'عرض القائمة',
    'mechanic.whoRequestedMe': 'من طلبني',
    'mechanic.myServices': 'خدماتي',
    'mechanic.mySkills': 'مهاراتي',
    'tow.whoRequestedMe': 'من طلبني',
    'tow.myServices': 'خدماتي',
    'tow.mySkills': 'مهاراتي',
    'rental.whoRequestedMe': 'من طلبني',
    'rental.myServices': 'خدماتي',
    'rental.mySkills': 'مهاراتي',
    'admin.edit': 'تعديل',
    'admin.addVehicle': 'إضافة مركبة',
    'admin.updateStatus': 'تحديث الحالة',
    'admin.requestsAssigned': 'الطلبات المعينة',
    'admin.towingRequests': 'طلبات السحب',
    'admin.fleetVehicles': 'مركبات الأسطول',
    'admin.activeRequests': 'الطلبات النشطة',
    'admin.manageUsers': 'إدارة المستخدمين',
    'admin.usersList': 'المستخدمون',
    'admin.editServices': 'تعديل الخدمات',
    'admin.assignedServices': 'الخدمات المعينة',
    'admin.save': 'حفظ',
    'admin.saved': 'تم الحفظ بنجاح.',
    'admin.cancel': 'إلغاء',
    'admin.block': 'حظر',
    'admin.unblock': 'إلغاء الحظر',
    'admin.userBlocked': 'تم حظر المستخدم.',
    'admin.userUnblocked': 'تم إلغاء حظر المستخدم.',
    'admin.searchUsers': 'البحث عن مستخدمين…',
    'admin.filterAll': 'الكل',
    'admin.verify': 'اعتماد',
    'admin.verified': 'تم اعتماد المزود.',
    'admin.userName': 'الاسم',
    'admin.userRole': 'الدور',
    'admin.userStatus': 'الحالة',
    'admin.servicesMechanic': 'خدمات الميكانيكي',
    'admin.servicesTow': 'خدمات الونش',
    'admin.servicesRental': 'خدمات التأجير',
    'request.createdSuccess': 'تم إرسال الطلب. سيتم إخطار أحد المزودين.',
    'request.statusUpdated': 'تم تحديث الحالة.',
    'request.trackBelow': 'تتبع حالة طلبك أدناه.',
    'map.requestHint': 'اضغط "طلب خدمة" للتأكيد والحصول على المساعدة.',
    'map.call': 'اتصال',
    'map.chat': 'دردشة',
    'map.noPhone': 'لا يوجد رقم هاتف.',
    'profile.servicesSaved': 'تم تحديث الخدمات.',
    'mechanic.accepted': 'تم قبول الطلب.',
    'mechanic.declined': 'تم رفض الطلب.',
    'mechanic.complete': 'إتمام',
    'mechanic.completed': 'تم إتمام الخدمة.',
    'mechanic.navigate': 'التنقل',
    'mechanic.noJobs': 'لا توجد مهام بعد. ستظهر الطلبات هنا عندما يحتاج العملاء مساعدة.',
    'mechanic.jobHistory': 'سجل المهام',
    'mechanic.noJobHistory': 'لا توجد مهام مكتملة بعد.',
    'mechanic.availability': 'الحالة',
    'mechanic.unavailable': 'غير متاح',
    'tow.noJobs': 'لا توجد مهام ونش بعد. ستظهر الطلبات هنا.',
    'tow.declined': 'تم رفض الطلب.',
    'tow.accepted': 'تم قبول الطلب.',
    'rental.noVehicles': 'لا توجد مركبات بعد. أضف مركبات أو انتظر الحجوزات.',
    'home.requestHelpNow': 'طلب مساعدة الآن',
    'request.confirmHint': 'اضغط الزر أدناه لإرسال طلبك. سيتم إخطار أحد المزودين.',
    'request.sentTitle': 'تم إرسال الطلب',
    'map.confirmOnNextScreen': 'أكد وأرسل طلبك في الشاشة التالية.',
    'auth.emailInvalid': 'يرجى إدخال بريد إلكتروني صحيح.',
  },
} as const;

