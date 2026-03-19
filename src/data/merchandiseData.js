// Mock data for the Merchandise module

export const premiumMerchandise = [
    {
        id: 'y1',
        type: 'PremiumProduct',
        title: 'Aetherion Precision Chronograph',
        filmReference: 'Aetherion: The Future Is Now',
        price: 250000,
        images: ['/images/bomber_jacket.png'],
        story: 'Forged from titanium recovered from the Aetherion set, this precision chronograph is identical to the one worn by Commander Nova in the climactic timeline sequence. Only 50 copies exist worldwide.',
        sceneInspiration: 'The climactic timeline jump in Aetherion where Commander Nova synchronizes the city grid.',
        culturalImpact: 'A symbol of precision and defying the impossible, resonating deeply with fans of the cyberpunk renaissance.',
        artisanOrigin: 'Geneva, Switzerland',
        manufacturingProcess: 'Hand-assembled over 300 hours utilizing quantum-locking mechanics and laser calibration.',
        engravingDetails: 'Backplate etched with the Aetherion constellation and individual limited edition numbering.',
        storyBooklet: {
            still: '/images/film_scifi.png',
            quote: '"Time isn\'t a straight line. It\'s a circle we draw ourselves."',
            designerNote: 'We wanted the watch to feel structurally complex but visually elegant, hiding a chaotic mechanical heart beneath a sheer titanium shell.',
            culturalInterpretation: 'The chronograph subverts traditional watch faces by placing hour markers in reverse order, symbolizing Nova\'s journey against time itself.',
        },
        digitalBooklet: [
            { type: 'image', title: 'Film Scene Snapshot', content: '/images/film_scifi.png', text: 'The climactic timeline jump.' },
            { type: 'text', title: 'Cultural Meaning', text: 'A symbol of precision and defying the impossible, resonating deeply with fans of the cyberpunk renaissance.' },
            { type: 'image', title: 'Design Sketch', content: '/images/bomber_jacket.png', text: 'Initial blueprints for the quantum-locking mechanism.' },
            { type: 'text', title: 'Craftsmanship Story', text: 'Hand-assembled over 300 hours utilizing quantum-locking mechanics and laser calibration.' },
            { type: 'text', title: 'Authentication Info', text: 'Grade 5 Titanium, Sapphire Crystal over dome. Authenticated by AUTH-Y-88392A' },
            { type: 'quote', title: 'Collector Note', text: '"Time isn\'t a straight line. It\'s a circle we draw ourselves."' }
        ],
        stock: 5,
        allocationEndTime: Date.now() + 86400000 * 2, // 2 days from now
        bookletContent: 'Includes director\'s notes on the timeline synchronicity.',
        releaseDate: '2027-01-15',
        serialNumber: 'AQ-001/050',
        editionSize: 50,
        craftDetails: 'Hand-assembled in Switzerland, quantum-locking mechanism.',
        materialDetails: 'Grade 5 Titanium, Sapphire Crystal over dome.',
        authenticationId: 'AUTH-Y-88392A',
        digitalTwinId: 'DT-CHRONO-883',
        allocationType: 'auction',
        archiveEntry: {
            filmId: 'aetherion-2027',
            relicId: 1,
            releaseYear: '2027',
            historicalContext: 'Aetherion defined the late 2020s cyberpunk aesthetic, relying heavily on functional prop design over CGI replacements.',
            collectorImpact: 'One of the first consumer-accessible artifacts to integrate functional quantum-locking mechanisms inspired directly by the film\'s lore.',
            stillUrl: '/images/film_scifi.png'
        },
        allocationCriteria: {
            minParticipationScore: 800,
            minCollectorRank: 'Silver'
        }
    },
    {
        id: 'y2',
        type: 'PremiumProduct',
        title: 'The Silhouette Diamond Ring',
        filmReference: 'The Silhouette',
        price: 150000,
        images: ['/images/diamond_ring.png'],
        story: 'This ring was the key plot device in The Silhouette — the mysterious heirloom passed down through three generations, harboring a secret code within the pavé setting.',
        sceneInspiration: 'The grand ballroom reveal where the ring catches the light of exactly 47 candles.',
        culturalImpact: 'Redefined modern noir aesthetics, blending classical romance with sheer tension.',
        artisanOrigin: 'Florence, Italy',
        manufacturingProcess: 'Lost-wax casting combined with micro-pavé setting by third-generation jewelers.',
        engravingDetails: 'Inner band features a microscopic engraving of the cipher from the film.',
        storyBooklet: {
            still: '/images/film_thriller.png',
            quote: '"Some secrets are too brilliant to hide in the dark."',
            designerNote: 'Every diamond was placed to reflect light at a very specific angle, crucial for the cinematic lighting of the ballroom sequence.',
            culturalInterpretation: 'The overlapping bands represent the intersecting lives of the three protagonists, bound by beauty and tragedy.',
        },
        digitalBooklet: [
            { type: 'image', title: 'Film Scene Snapshot', content: '/images/film_thriller.png', text: 'The grand ballroom reveal.' },
            { type: 'text', title: 'Cultural Meaning', text: 'Redefined modern noir aesthetics, blending classical romance with sheer tension.' },
            { type: 'image', title: 'Design Sketch', content: '/images/diamond_ring.png', text: 'Micro-pavé setting blueprints.' },
            { type: 'text', title: 'Craftsmanship Story', text: 'Lost-wax casting combined with micro-pavé setting by third-generation jewelers.' },
            { type: 'text', title: 'Authentication Info', text: '18K rose gold, 2.5 carats round-cut diamonds. Authenticated by AUTH-Y-12889C' },
            { type: 'quote', title: 'Collector Note', text: '"Some secrets are too brilliant to hide in the dark."' }
        ],
        stock: 12,
        allocationEndTime: Date.now() + 86400000 * 5, // 5 days from now
        bookletContent: 'Exclusive screenplay scenes involving the heirloom.',
        releaseDate: '2026-11-01',
        serialNumber: 'SR-012/100',
        editionSize: 100,
        craftDetails: 'Hand-set pavé stones, double safety clasp.',
        materialDetails: '18K rose gold, 2.5 carats round-cut diamonds.',
        authenticationId: 'AUTH-Y-12889C',
        digitalTwinId: 'DT-RING-128',
        allocationType: 'direct',
        archiveEntry: {
            filmId: 'silhouette-2026',
            relicId: 2,
            releaseYear: '2026',
            historicalContext: 'Renowned for its practical lighting setups, The Silhouette utilized precisely cut diamonds to capture real candlelight.',
            collectorImpact: 'Brought micro-pavé techniques back into the zeitgeist, highly sought-after by cinematic historians and jewelers alike.',
            stillUrl: '/images/film_thriller.png'
        },
        allocationCriteria: {
            minParticipationScore: 500,
            minCollectorRank: 'Bronze'
        }
    },
    {
        id: 'y3',
        type: 'PremiumProduct',
        title: 'Star of Aetherion Necklace',
        filmReference: 'Aetherion: The Future Is Now',
        price: 80000,
        images: ['/images/diamond_necklace.png'],
        story: 'This necklace was crafted as an exact replica of the legendary artifact that powers the city\'s energy grid in Aetherion. Each facet is precisely cut to mimic the crystal heart of the reactor.',
        sceneInspiration: 'The descent into the Core, where the necklace first activates and hums with quantum energy.',
        culturalImpact: 'A true collector\'s grail that embodies the visual language of futuristic opulence.',
        artisanOrigin: 'Paris, France',
        manufacturingProcess: 'Laser-cut filigree and hand-polished center stone requiring 400 hours of delicate finishing.',
        engravingDetails: 'Clasp engraved with the coordinates of the Aetherion Spire.',
        storyBooklet: {
            still: '/images/film_scifi.png',
            quote: '"Power isn\'t given. It is worn."',
            designerNote: 'The challenge was making a piece of jewelry look like a functional sci-fi power core without losing its high-fashion appeal.',
            culturalInterpretation: 'The pear shape mimicking a teardrop signifies the emotional weight of carrying the city\'s survival around one\'s neck.',
        },
        digitalBooklet: [
            { type: 'image', title: 'Film Scene Snapshot', content: '/images/film_scifi.png', text: 'The descent into the Core.' },
            { type: 'text', title: 'Cultural Meaning', text: 'A true collector\'s grail that embodies the visual language of futuristic opulence.' },
            { type: 'image', title: 'Design Sketch', content: '/images/diamond_necklace.png', text: 'Laser-cut filigree drafts.' },
            { type: 'text', title: 'Craftsmanship Story', text: 'Laser-cut filigree and hand-polished center stone requiring 400 hours of delicate finishing.' },
            { type: 'text', title: 'Authentication Info', text: '18K gold with filigree detailing. Authenticated by AUTH-Y-45520F' },
            { type: 'quote', title: 'Collector Note', text: '"Power isn\'t given. It is worn."' }
        ],
        stock: 2,
        allocationEndTime: Date.now() + 86400000 * 1, // 1 day from now
        bookletContent: 'Concept art for the Aetherion energy core.',
        releaseDate: '2026-12-25',
        serialNumber: 'AN-045/200',
        editionSize: 200,
        craftDetails: 'Features a center pear-shaped diamond surrounded by 38 smaller brilliant cuts.',
        materialDetails: '18K gold with filigree detailing.',
        authenticationId: 'AUTH-Y-45520F',
        digitalTwinId: 'DT-NECK-455',
        allocationType: 'draw',
        archiveEntry: {
            filmId: 'aetherion-2027',
            relicId: 1,
            releaseYear: '2027',
            historicalContext: 'The necklace served as the central macguffin connecting the narrative arc across all three acts of the film.',
            collectorImpact: 'Represents the pinnacle of cinematic prop replication, maintaining exact dimensions and weight of the on-screen counterpart.',
            stillUrl: '/images/film_scifi.png'
        },
        allocationCriteria: {
            minParticipationScore: 900,
            minCollectorRank: 'Gold'
        }
    },
    {
        id: 'y4',
        type: 'PremiumProduct',
        title: 'Quantum Field Prop Core',
        filmReference: 'Aetherion: The Future Is Now',
        price: 320000,
        images: ['/images/scifi_weapon.png'],
        story: 'One of the three original props used in the climactic engine room sequence, preserved exactly as it was when the cameras rolled.',
        sceneInspiration: 'The intense 12-minute unbroken tracking shot through the reactor core.',
        culturalImpact: 'A defining piece of history for sci-fi practical effects fans.',
        artisanOrigin: 'Pinewood Studios, UK',
        manufacturingProcess: 'Machined from aircraft-grade aluminum with integrated fiber-optic lighting rigs.',
        engravingDetails: 'Property of Horizon Studios engraved on the mounting bracket.',
        storyBooklet: {
            still: '/images/film_scifi.png',
            quote: '"This core didn\'t just power the city. It powered the audience\'s imagination."',
            designerNote: 'We wanted it to feel impossibly dense and dangerous to look at.',
            culturalInterpretation: 'A testament to the enduring power of practical filmmaking over pure CGI.',
        },
        digitalBooklet: [
            { type: 'image', title: 'Film Scene Snapshot', content: '/images/film_scifi.png', text: 'The unbroken tracking shot.' },
            { type: 'text', title: 'Cultural Meaning', text: 'A defining piece of history for sci-fi practical effects.' },
            { type: 'text', title: 'Authentication Info', text: 'Prop Archive ID: PROP-Y-99801A' },
            { type: 'quote', title: 'Collector Note', text: '"It powered the audience\'s imagination."' }
        ],
        stock: 1,
        allocationEndTime: Date.now() + 86400000 * 3,
        bookletContent: 'Original prop master schemas.',
        releaseDate: '2026-11-20',
        serialNumber: 'PR-1/3',
        editionSize: 3,
        craftDetails: 'Authentic screen-used prop with functional LEDs.',
        materialDetails: 'Aircraft-grade aluminum.',
        authenticationId: 'PROP-Y-99801A',
        digitalTwinId: 'DT-CORE-998',
        allocationType: 'auction',
        archiveEntry: {
            filmId: 'aetherion-2027',
            relicId: 1,
            releaseYear: '2027',
            historicalContext: 'Set a new benchmark for practical reactor designs.',
            collectorImpact: 'An ultra-rare museum-grade piece.',
            stillUrl: '/images/film_scifi.png'
        },
        allocationCriteria: {
            minParticipationScore: 1500,
            minCollectorRank: 'Legendary'
        }
    },
    {
        id: 'y5',
        type: 'PremiumProduct',
        title: 'Enigma Box',
        filmReference: 'The Silhouette',
        price: 90000,
        images: ['/images/scifi_weapon.png'],
        story: 'A puzzle box holding the core mystery of the film.',
        sceneInspiration: 'The moment the detective decodes the first clue.',
        culturalImpact: 'Celebrated by puzzle solvers and noir fans.',
        artisanOrigin: 'Kyoto, Japan',
        manufacturingProcess: 'Hand-carved mahogany and brass fittings.',
        engravingDetails: 'Subtle film crest on base.',
        storyBooklet: {
            still: '/images/film_thriller.png',
            quote: '"Some puzzles crave solving."',
            designerNote: 'Designed to actual working specifications.',
            culturalInterpretation: 'Shows the complexity of truth.',
        },
        digitalBooklet: [
            { type: 'image', title: 'Snapshot', content: '/images/film_thriller.png', text: 'Decoding the clue.' }
        ],
        stock: 8,
        allocationEndTime: Date.now() + 86400000 * 4,
        bookletContent: 'Original blueprints.',
        releaseDate: '2026-08-10',
        serialNumber: 'EB-001/100',
        editionSize: 100,
        craftDetails: 'Hand-finished wood.',
        materialDetails: 'Mahogany and brass.',
        authenticationId: 'PROP-Y-8812A',
        digitalTwinId: 'DT-ENIGMA-100',
        allocationType: 'direct',
        archiveEntry: {
            filmId: 'silhouette-2026',
            relicId: 2,
            releaseYear: '2026',
            historicalContext: 'Iconic puzzle box.',
            collectorImpact: 'Highly sought after.',
            stillUrl: '/images/film_thriller.png'
        },
        allocationCriteria: {
            minParticipationScore: 400,
            minCollectorRank: 'Bronze'
        }
    },
    {
        id: 'y6',
        type: 'PremiumProduct',
        title: 'Galactic Compass',
        filmReference: 'Aetherion: The Future Is Now',
        price: 120000,
        images: ['/images/scifi_weapon.png'],
        story: 'The very compass Nova used to navigate the wasteland.',
        sceneInspiration: 'Nova checking direction before the storm.',
        culturalImpact: 'A symbol of finding one\'s way.',
        artisanOrigin: 'Berlin, Germany',
        manufacturingProcess: 'Machined steel.',
        engravingDetails: 'Nova\'s initials.',
        storyBooklet: {
            still: '/images/film_scifi.png',
            quote: '"True north is wherever we\'re heading."',
            designerNote: 'Heavy in the hand, tactile feedback.',
            culturalInterpretation: 'Directionless future needs a guide.',
        },
        digitalBooklet: [
            { type: 'image', title: 'Snapshot', content: '/images/film_scifi.png', text: 'Navigation.' }
        ],
        stock: 5,
        allocationEndTime: Date.now() + 86400000 * 2,
        bookletContent: 'Wasteland map.',
        releaseDate: '2026-07-20',
        serialNumber: 'GC-005/050',
        editionSize: 50,
        craftDetails: 'Functional magnetic compass.',
        materialDetails: 'Stainless steel.',
        authenticationId: 'PROP-Y-7712B',
        digitalTwinId: 'DT-COMP-050',
        allocationType: 'auction',
        archiveEntry: {
            filmId: 'aetherion-2027',
            relicId: 1,
            releaseYear: '2027',
            historicalContext: 'Key navigation prop.',
            collectorImpact: 'Rare navigation item.',
            stillUrl: '/images/film_scifi.png'
        },
        allocationCriteria: {
            minParticipationScore: 800,
            minCollectorRank: 'Silver'
        }
    },
    {
        id: 'y7',
        type: 'PremiumProduct',
        title: 'Noir Silk Tie',
        filmReference: 'The Silhouette',
        price: 45000,
        images: ['/images/bomber_jacket.png'],
        story: 'The signature tie worn in the final confrontation.',
        sceneInspiration: 'The rain-soaked rooftop final climax.',
        culturalImpact: 'Revitalized formal wear in modern fashion.',
        artisanOrigin: 'Milan, Italy',
        manufacturingProcess: 'Hand-woven silk.',
        engravingDetails: 'None.',
        storyBooklet: {
            still: '/images/film_thriller.png',
            quote: '"Dress for the end."',
            designerNote: 'Sleek, sharp, deadly.',
            culturalInterpretation: 'Symbol of order in chaos.',
        },
        digitalBooklet: [
            { type: 'image', title: 'Snapshot', content: '/images/film_thriller.png', text: 'Rooftop fight.' }
        ],
        stock: 15,
        allocationEndTime: Date.now() + 86400000 * 5,
        bookletContent: 'Costume notes.',
        releaseDate: '2026-06-15',
        serialNumber: 'TIE-015/200',
        editionSize: 200,
        craftDetails: '100% Silk.',
        materialDetails: 'Silk.',
        authenticationId: 'PROP-Y-6612C',
        digitalTwinId: 'DT-TIE-200',
        allocationType: 'direct',
        archiveEntry: {
            filmId: 'silhouette-2026',
            relicId: 2,
            releaseYear: '2026',
            historicalContext: 'Classic noir trope.',
            collectorImpact: 'Wearable piece of history.',
            stillUrl: '/images/film_thriller.png'
        },
        allocationCriteria: {
            minParticipationScore: 300,
            minCollectorRank: 'Bronze'
        }
    },
    {
        id: 'y8',
        type: 'PremiumProduct',
        title: 'Commander Nova Visor',
        filmReference: 'Aetherion: The Future Is Now',
        price: 210000,
        images: ['/images/scifi_weapon.png'],
        story: 'Iconic glowing visor from the poster.',
        sceneInspiration: 'First reveal of Commander Nova.',
        culturalImpact: 'The face of the franchise.',
        artisanOrigin: 'Los Angeles, USA',
        manufacturingProcess: '3D printed carbon fiber.',
        engravingDetails: 'Serial number inside rim.',
        storyBooklet: {
            still: '/images/film_scifi.png',
            quote: '"I see it all."',
            designerNote: 'Futuristic but grounded.',
            culturalInterpretation: 'The loss of humanity in tech.',
        },
        digitalBooklet: [
            { type: 'image', title: 'Snapshot', content: '/images/film_scifi.png', text: 'Visor reveal.' }
        ],
        stock: 3,
        allocationEndTime: Date.now() + 86400000 * 1,
        bookletContent: 'Design process.',
        releaseDate: '2027-02-10',
        serialNumber: 'VIS-003/020',
        editionSize: 20,
        craftDetails: 'Working LED strip.',
        materialDetails: 'Carbon fiber.',
        authenticationId: 'PROP-Y-5512D',
        digitalTwinId: 'DT-VIS-020',
        allocationType: 'draw',
        archiveEntry: {
            filmId: 'aetherion-2027',
            relicId: 1,
            releaseYear: '2027',
            historicalContext: 'Most recognizable prop.',
            collectorImpact: 'Grail item.',
            stillUrl: '/images/film_scifi.png'
        },
        allocationCriteria: {
            minParticipationScore: 1200,
            minCollectorRank: 'Gold'
        }
    },
    {
        id: 'y9',
        type: 'PremiumProduct',
        title: 'Vance Detective Badge',
        filmReference: 'The Silhouette',
        price: 65000,
        images: ['/images/scifi_weapon.png'],
        story: 'The badge that started it all.',
        sceneInspiration: 'Walking into the precinct.',
        culturalImpact: 'Classic symbol of authority.',
        artisanOrigin: 'New York, USA',
        manufacturingProcess: 'Stamped heavy brass.',
        engravingDetails: 'Badge number 774.',
        storyBooklet: {
            still: '/images/film_thriller.png',
            quote: '"It\'s just a piece of metal, until you pin it on."',
            designerNote: 'Authentic weight and feel.',
            culturalInterpretation: 'The burden of justice.',
        },
        digitalBooklet: [
            { type: 'image', title: 'Snapshot', content: '/images/film_thriller.png', text: 'Pinning the badge.' }
        ],
        stock: 10,
        allocationEndTime: Date.now() + 86400000 * 6,
        bookletContent: 'Character background.',
        releaseDate: '2026-05-01',
        serialNumber: 'BDG-010/150',
        editionSize: 150,
        craftDetails: 'Aged brass finish.',
        materialDetails: 'Brass.',
        authenticationId: 'PROP-Y-4412E',
        digitalTwinId: 'DT-BDG-150',
        allocationType: 'direct',
        archiveEntry: {
            filmId: 'silhouette-2026',
            relicId: 2,
            releaseYear: '2026',
            historicalContext: 'Prop used in multiple scenes.',
            collectorImpact: 'Fan favorite collectible.',
            stillUrl: '/images/film_thriller.png'
        },
        allocationCriteria: {
            minParticipationScore: 500,
            minCollectorRank: 'Silver'
        }
    },
    {
        id: 'y10',
        type: 'PremiumProduct',
        title: 'Obsidian Monolith Fragment',
        filmReference: 'Aetherion: The Future Is Now',
        price: 400000,
        images: ['/images/scifi_weapon.png'],
        story: 'A piece of the very structure that caused the timeline tear.',
        sceneInspiration: 'The breach scene.',
        culturalImpact: 'The absolute pinnacle of the film\'s lore.',
        artisanOrigin: 'Unknown',
        manufacturingProcess: 'Resin cast with suspended iridescence.',
        engravingDetails: 'None.',
        storyBooklet: {
            still: '/images/film_scifi.png',
            quote: '"Don\'t touch it."',
            designerNote: 'Designed to look completely alien.',
            culturalInterpretation: 'The unknown terror.',
        },
        digitalBooklet: [
            { type: 'image', title: 'Snapshot', content: '/images/film_scifi.png', text: 'The breach.' }
        ],
        stock: 1,
        allocationEndTime: Date.now() + 86400000 * 2,
        bookletContent: 'Lore explainer.',
        releaseDate: '2027-03-01',
        serialNumber: 'MON-001/005',
        editionSize: 5,
        craftDetails: 'Unique pour, no two are alike.',
        materialDetails: 'Resin.',
        authenticationId: 'PROP-Y-3312F',
        digitalTwinId: 'DT-MON-005',
        allocationType: 'auction',
        archiveEntry: {
            filmId: 'aetherion-2027',
            relicId: 1,
            releaseYear: '2027',
            historicalContext: 'The most expensive prop created for the film.',
            collectorImpact: 'The ultimate trophy.',
            stillUrl: '/images/film_scifi.png'
        },
        allocationCriteria: {
            minParticipationScore: 2000,
            minCollectorRank: 'Legendary'
        }
    }
];

export const dailyMerchandise = [
    {
        id: 'o1',
        type: 'DailyProduct',
        title: 'Neo-Tokyo Graphic Tee',
        filmReference: 'Aetherion: The Future Is Now',
        price: 1499,
        images: ['/images/leather_jacket.png'], // Keeping existing images as placeholders
        story: 'A tribute to the neon-drenched streets of sector 4. It captures the exact ambient glow from the opening sequence, bringing a slice of the cinematic future to your everyday wardrobe.',
        memoryReference: 'The moment Commander Nova steps into the rain, illuminated by the holographic billboards.',
        memoryMatters: 'It represents the calm before the chaos—a fleeting moment of humanity in a synthetic world.',
        bookletContent: 'A digital fold-out map of Neo-Tokyo.',
        releaseDate: '2026-10-05',
        dailyWearTag: 'Heavyweight Cotton',
        fabricDetails: '100% Organic Cotton (220 GSM). Pre-shrunk and bio-washed for an incredibly soft feel.',
        practicalUsage: 'Designed for layering or standing alone. Perfect for late-night coffee runs or casual Friday.',
        durability: 'Reinforced double-stitched collar and hems to withstand daily urban wear.',
        culturalMeaning: 'Wearing this signifies a connection to the cyberpunk dream—embracing technology without losing one\'s soul.',
        seasonalDrop: 'Autumn 2026',
        bookletLite: {
            storyPage: 'Nova looked up. The rain tasted like metal and regret. But the glowing neon signs? They felt like home.',
            filmReference: 'Act 1, Scene 3: The Neon Sector',
            culturalNote: 'The color palette was intentionally designed to evoke nostalgia for late 80s arcade culture while pushing a modern, sleek aesthetic.'
        },
        digitalBooklet: [
            { type: 'text', title: 'Act 1, Scene 3: The Neon Sector', text: 'Nova looked up. The rain tasted like metal and regret. But the glowing neon signs? They felt like home.' },
            { type: 'text', title: 'Emotional Story', text: 'It represents the calm before the chaos—a fleeting moment of humanity in a synthetic world.' },
            { type: 'text', title: 'Cultural Tagline', text: 'Wearing this signifies a connection to the cyberpunk dream—embracing technology without losing one\'s soul.' }
        ],
        archiveEntry: {
            filmId: 'aetherion-2027',
            relicId: 3,
            releaseYear: '2027',
            historicalContext: 'The casual streetwear of Sector 4 became an instant trend, blending dystopian angst with high-street fashion.',
            collectorImpact: 'A daily wearable that discreetly flags the wearer as a member of the Aetherion cinematic universe fan base.',
            stillUrl: '/images/film_scifi.png'
        }
    },
    {
        id: 'o2',
        type: 'DailyProduct',
        title: 'Cinematic Essential Hoodie',
        filmReference: 'The Silhouette',
        price: 1899,
        images: ['/images/bomber_jacket.png'],
        story: 'An understated, incredibly comfortable hoodie inspired by the protagonist\'s low-profile attire during the iconic chase scene. It\'s about moving through the world unnoticed, yet undeniably present.',
        memoryReference: 'The tense, silent pursuit through the foggy alleyways.',
        memoryMatters: 'This memory resonates because we all have days where we need to put our hood up and just get through the noise.',
        bookletContent: 'Behind the scenes photography from the set.',
        releaseDate: '2026-09-15',
        dailyWearTag: 'Fleece Lined',
        fabricDetails: '80% Cotton, 20% Recycled Polyester fleece. Incredibly warm with a structured drape.',
        practicalUsage: 'Your go-to outer layer for crisp mornings and chilly theater rooms.',
        durability: 'Features a substantial zipper and ribbed cuffs that retain their elasticity over time.',
        culturalMeaning: 'A staple of modern minimalism. It represents the "quiet luxury" of the film\'s cinematography.',
        seasonalDrop: 'Autumn 2026',
        bookletLite: {
            storyPage: 'Sometimes the loudest statement is silence. The hood goes up, the world fades out.',
            filmReference: 'Act 3, The Alley Chase',
            culturalNote: 'The hoodie has evolved from athletic wear to a modern armor. This piece captures that transition beautifully.'
        },
        digitalBooklet: [
            { type: 'text', title: 'Act 3, The Alley Chase', text: 'Sometimes the loudest statement is silence. The hood goes up, the world fades out.' },
            { type: 'text', title: 'Emotional Story', text: 'This memory resonates because we all have days where we need to put our hood up and just get through the noise.' },
            { type: 'text', title: 'Cultural Tagline', text: 'A staple of modern minimalism. It represents the "quiet luxury" of the film\'s cinematography.' }
        ],
        archiveEntry: {
            filmId: 'silhouette-2026',
            relicId: 4,
            releaseYear: '2026',
            historicalContext: 'The unmarked grey hoodie became the defining silhouette of the anti-hero protagonist throughout the second act.',
            collectorImpact: 'Elevated the standard hoodie into a piece of culturally significant cinematic armor.',
            stillUrl: '/images/film_thriller.png'
        }
    },
    {
        id: 'o3',
        type: 'DailyProduct',
        title: 'Everyday Tote: "The Mansion"',
        filmReference: 'The Silhouette',
        price: 899,
        images: ['/images/elegant_dress.png'],
        story: 'A highly functional, minimalist tote bag featuring a subtle, debossed architectural outline of the mansion. It carries your daily essentials while whispering a story only true fans will recognize.',
        memoryReference: 'The grand entrance at the mansion, where the real game begins.',
        memoryMatters: 'It marks the threshold between ordinary life and extraordinary mystery.',
        bookletContent: 'Costume design notes and sketches.',
        releaseDate: '2026-08-20',
        dailyWearTag: 'Heavy Canvas',
        fabricDetails: '14oz sturdy organic canvas with reinforced vegan leather straps.',
        practicalUsage: 'Easily fits a 15-inch laptop, groceries, or scripts. Includes a zipped inner pocket.',
        durability: 'Engineered to carry up to 10kg without strap strain or fabric tearing.',
        culturalMeaning: 'Tote bags are the modern canvas of identity. This one says you appreciate the finer mysteries of cinema.',
        seasonalDrop: 'Summer 2026',
        bookletLite: {
            storyPage: 'You have your invitation. The doors open. Everything inside this bag is just preparation for what comes next.',
            filmReference: 'Act 1, The Invitation',
            culturalNote: 'The subtle debossing honors the film\'s theme of hidden truths—the design is only visible when the light hits it just right.'
        },
        digitalBooklet: [
            { type: 'text', title: 'Act 1, The Invitation', text: 'You have your invitation. The doors open. Everything inside this bag is just preparation for what comes next.' },
            { type: 'text', title: 'Emotional Story', text: 'It marks the threshold between ordinary life and extraordinary mystery.' },
            { type: 'text', title: 'Cultural Tagline', text: 'Tote bags are the modern canvas of identity. This one says you appreciate the finer mysteries of cinema.' }
        ],
        archiveEntry: {
            filmId: 'silhouette-2026',
            relicId: 5,
            releaseYear: '2026',
            historicalContext: 'Used repeatedly as the visual anchor for the protagonist\'s transition between civilian life and the secret society.',
            collectorImpact: 'An understated everyday carry that subtly links the owner to the film\'s rich architectural lore.',
            stillUrl: '/images/film_thriller.png'
        }
    },
    {
        id: 'o4',
        type: 'DailyProduct',
        title: 'Sector 4 Beanie',
        filmReference: 'Aetherion: The Future Is Now',
        price: 599,
        images: ['/images/leather_jacket.png'],
        story: 'A classic ribbed beanie as worn by the mechanics in the lower levels. Warm, stealthy, and inherently cool.',
        memoryReference: 'The underground rebel meetings.',
        memoryMatters: 'A nod to the unsung heroes of the narrative.',
        bookletContent: 'Rebel alliance symbol drafts.',
        releaseDate: '2026-11-01',
        dailyWearTag: 'Thermal Ribbed Knit',
        fabricDetails: 'Merino wool blend.',
        practicalUsage: 'Winter survival in the concrete jungle.',
        durability: 'Retains shape after washing.',
        culturalMeaning: 'Subtle allegiance to the resistance.',
        seasonalDrop: 'Winter 2026',
        bookletLite: {
            storyPage: 'Stay warm, stay hidden.',
            filmReference: 'Act 2, The Underground',
            culturalNote: 'Utilitarian headwear adopted as a symbol of defiance.'
        },
        digitalBooklet: [
            { type: 'text', title: 'Act 2, The Underground', text: 'Stay warm, stay hidden.' }
        ],
        archiveEntry: {
            filmId: 'aetherion-2027',
            relicId: 3,
            releaseYear: '2027',
            historicalContext: 'The standard issue rebel headwear.',
            collectorImpact: 'A cheap but culturally heavy piece of merch.',
            stillUrl: '/images/film_scifi.png'
        }
    },
    {
        id: 'o5',
        type: 'DailyProduct',
        title: 'Rebel Alliance Mug',
        filmReference: 'Aetherion: The Future Is Now',
        price: 399,
        images: ['/images/elegant_dress.png'],
        story: 'Start your morning with the glow of the resistance.',
        memoryReference: 'The diner scene planning session.',
        memoryMatters: 'Even rebels need coffee.',
        bookletContent: 'Diner sketches.',
        releaseDate: '2026-12-01',
        dailyWearTag: 'Ceramic',
        fabricDetails: 'Ceramic.',
        practicalUsage: 'Holds hot liquids.',
        durability: 'Dishwasher safe.',
        culturalMeaning: 'A subtle nod at the office.',
        seasonalDrop: 'Winter 2026',
        bookletLite: {
            storyPage: 'Black coffee. No sugar.',
            filmReference: 'Act 1, The Diner',
            culturalNote: 'Common item, uncommon meaning.'
        },
        digitalBooklet: [
            { type: 'text', title: 'Act 1, The Diner', text: 'Black coffee. No sugar.' }
        ],
        archiveEntry: {
            filmId: 'aetherion-2027',
            relicId: 3,
            releaseYear: '2027',
            historicalContext: 'Diner props.',
            collectorImpact: 'Fun daily reminder.',
            stillUrl: '/images/film_scifi.png'
        }
    },
    {
        id: 'o6',
        type: 'DailyProduct',
        title: 'Detective Trench Pin',
        filmReference: 'The Silhouette',
        price: 299,
        images: ['/images/leather_jacket.png'],
        story: 'Pin it to your trench, blazer, or bag.',
        memoryReference: 'The lapel shot in the rainy intro.',
        memoryMatters: 'Small details make the detective.',
        bookletContent: 'Wardrobe notes.',
        releaseDate: '2026-05-15',
        dailyWearTag: 'Enamel Pin',
        fabricDetails: 'Zinc alloy soft enamel.',
        practicalUsage: 'Accessory.',
        durability: 'Scratch resistant.',
        culturalMeaning: 'Belonging to the classic era.',
        seasonalDrop: 'Spring 2026',
        bookletLite: {
            storyPage: 'The devil is in the details.',
            filmReference: 'Opening string.',
            culturalNote: 'Pin culture revival.'
        },
        digitalBooklet: [
            { type: 'text', title: 'Opening string', text: 'The devil is in the details.' }
        ],
        archiveEntry: {
            filmId: 'silhouette-2026',
            relicId: 4,
            releaseYear: '2026',
            historicalContext: 'Costume flair.',
            collectorImpact: 'Accessible collectible.',
            stillUrl: '/images/film_thriller.png'
        }
    },
    {
        id: 'o7',
        type: 'DailyProduct',
        title: 'Sector 4 Lanyard',
        filmReference: 'Aetherion: The Future Is Now',
        price: 199,
        images: ['/images/bomber_jacket.png'],
        story: 'Keep your ID secure in the corporate zones.',
        memoryReference: 'The security checkpoint scene.',
        memoryMatters: 'Access is everything.',
        bookletContent: 'Security protocols.',
        releaseDate: '2026-11-15',
        dailyWearTag: 'Nylon',
        fabricDetails: 'Durable nylon strap.',
        practicalUsage: 'Holding keys/IDs.',
        durability: 'Breakaway clasp.',
        culturalMeaning: 'Corporate dystopia chic.',
        seasonalDrop: 'Fall 2026',
        bookletLite: {
            storyPage: 'Show your papers.',
            filmReference: 'Act 2 Checkpoint.',
            culturalNote: 'Functional daily gear.'
        },
        digitalBooklet: [
            { type: 'text', title: 'Act 2 Checkpoint', text: 'Show your papers.' }
        ],
        archiveEntry: {
            filmId: 'aetherion-2027',
            relicId: 3,
            releaseYear: '2027',
            historicalContext: 'Background extra prop.',
            collectorImpact: 'Workplace conversation starter.',
            stillUrl: '/images/film_scifi.png'
        }
    },
    {
        id: 'o8',
        type: 'DailyProduct',
        title: 'Mansion Key Keychain',
        filmReference: 'The Silhouette',
        price: 499,
        images: ['/images/elegant_dress.png'],
        story: 'Heavy, ornate, and opens no doors.',
        memoryReference: 'The locked room mystery.',
        memoryMatters: 'Some doors shouldn\'t be opened.',
        bookletContent: 'Prop sketches.',
        releaseDate: '2026-06-20',
        dailyWearTag: 'Metal Cast',
        fabricDetails: 'Zinc alloy.',
        practicalUsage: 'Keychain.',
        durability: 'Solid metal.',
        culturalMeaning: 'Keeping secrets close.',
        seasonalDrop: 'Summer 2026',
        bookletLite: {
            storyPage: 'Turn the key.',
            filmReference: 'Act 2, The Room.',
            culturalNote: 'Classic thriller trope.'
        },
        digitalBooklet: [
            { type: 'text', title: 'Act 2, The Room', text: 'Turn the key.' }
        ],
        archiveEntry: {
            filmId: 'silhouette-2026',
            relicId: 5,
            releaseYear: '2026',
            historicalContext: 'The macguffin key.',
            collectorImpact: 'Weighty and satisfying.',
            stillUrl: '/images/film_thriller.png'
        }
    },
    {
        id: 'o9',
        type: 'DailyProduct',
        title: 'Nova Tech Gloves',
        filmReference: 'Aetherion: The Future Is Now',
        price: 899,
        images: ['/images/leather_jacket.png'],
        story: 'Touchscreen compatible mechanic gloves.',
        memoryReference: 'Hacking the mainframe.',
        memoryMatters: 'Dexterity is survival.',
        bookletContent: 'Tech specs.',
        releaseDate: '2026-10-10',
        dailyWearTag: 'Tech Wear',
        fabricDetails: 'Nylon/Spandex blend.',
        practicalUsage: 'Winter phone usage.',
        durability: 'Reinforced palms.',
        culturalMeaning: 'Hacker aesthetic.',
        seasonalDrop: 'Fall 2026',
        bookletLite: {
            storyPage: 'Type fast. Run faster.',
            filmReference: 'Act 3, The Hack.',
            culturalNote: 'Functional futurism.'
        },
        digitalBooklet: [
            { type: 'text', title: 'Act 3, The Hack', text: 'Type fast. Run faster.' }
        ],
        archiveEntry: {
            filmId: 'aetherion-2027',
            relicId: 3,
            releaseYear: '2027',
            historicalContext: 'Practical costume design.',
            collectorImpact: 'Very useful daily item.',
            stillUrl: '/images/film_scifi.png'
        }
    },
    {
        id: 'o10',
        type: 'DailyProduct',
        title: 'Classic Noir Notebook',
        filmReference: 'The Silhouette',
        price: 699,
        images: ['/images/bomber_jacket.png'],
        story: 'Where the detective kept all his secrets.',
        memoryReference: 'The final deciphering.',
        memoryMatters: 'Keep track of the clues in your own life.',
        bookletContent: 'Blank, waiting for you.',
        releaseDate: '2026-04-10',
        dailyWearTag: 'Stationery',
        fabricDetails: 'Faux leather cover, 120gsm paper.',
        practicalUsage: 'Journaling.',
        durability: 'Stitched binding.',
        culturalMeaning: 'Analog in a digital world.',
        seasonalDrop: 'Spring 2026',
        bookletLite: {
            storyPage: 'Write it down before you forget it.',
            filmReference: 'Throughout the film.',
            culturalNote: 'The return to analog.'
        },
        digitalBooklet: [
            { type: 'text', title: 'Throughout the film', text: 'Write it down before you forget it.' }
        ],
        archiveEntry: {
            filmId: 'silhouette-2026',
            relicId: 4,
            releaseYear: '2026',
            historicalContext: 'The notebook that held the script\'s answers.',
            collectorImpact: 'A functional daily replica.',
            stillUrl: '/images/film_thriller.png'
        }
    }
];

export const formatPrice = (price) => '₹' + price.toLocaleString('en-IN');
