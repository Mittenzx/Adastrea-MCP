/**
 * Unreal Engine 5.6+ Knowledge Database
 * 
 * A comprehensive database of Unreal Engine systems, features, and best practices
 * gathered from official documentation, community forums, and expert sources.
 * 
 * This knowledge base is designed to help AI agents and developers understand
 * and work with Unreal Engine 5.6+ systems effectively.
 */

export interface SystemReference {
  title: string;
  url: string;
  type: 'official_docs' | 'tutorial' | 'forum' | 'video' | 'article' | 'github';
}

export interface SystemFeature {
  name: string;
  description: string;
  since?: string; // Version introduced (e.g., "5.6", "5.5")
  status?: 'stable' | 'experimental' | 'deprecated';
}

export interface BestPractice {
  title: string;
  description: string;
  category: 'performance' | 'architecture' | 'workflow' | 'security' | 'optimization';
}

export interface SystemCategory {
  id: string;
  name: string;
  description: string;
  overview: string;
  keyFeatures: SystemFeature[];
  bestPractices: BestPractice[];
  relatedSystems: string[]; // IDs of related systems
  references: SystemReference[];
  version: string; // Minimum UE version (e.g., "5.6")
  tags: string[];
}

/**
 * Comprehensive Unreal Engine 5.6+ Knowledge Database
 */
export const UnrealEngineKnowledge: Record<string, SystemCategory> = {
  'core-architecture': {
    id: 'core-architecture',
    name: 'Core Architecture',
    description: 'Fundamental architectural patterns and systems in Unreal Engine',
    overview: 'Unreal Engine is built on a modular architecture with discrete modules for different systems. The engine uses subsystems for reusable frameworks, supports both C++ and Blueprint scripting, and provides extensive asset management capabilities.',
    keyFeatures: [
      {
        name: 'Modular Architecture',
        description: 'Engine organized into logical, discrete modules (graphics, audio, AI, physics, etc.) for efficient management and maintainability',
        status: 'stable'
      },
      {
        name: 'Subsystems',
        description: 'Specialized, reusable frameworks for recurring engine features or editor-wide systems including asset loading, data validation, and console variable management',
        status: 'stable'
      },
      {
        name: 'Asset Management',
        description: 'Asynchronous asset loading, asset registry, and referencing systems for smooth runtime performance and flexibility',
        status: 'stable'
      }
    ],
    bestPractices: [
      {
        title: 'Use Module Separation',
        description: 'Organize your code into logical modules to improve maintainability and compilation times',
        category: 'architecture'
      }
    ],
    relatedSystems: ['gameplay-framework', 'rendering-system'],
    references: [
      {
        title: 'Programming in the Unreal Engine Architecture',
        url: 'https://dev.epicgames.com/documentation/en-us/unreal-engine/programming-in-the-unreal-engine-architecture',
        type: 'official_docs'
      }
    ],
    version: '5.0',
    tags: ['architecture', 'core', 'modules', 'subsystems']
  },

  'gameplay-framework': {
    id: 'gameplay-framework',
    name: 'Gameplay Framework',
    description: 'Core gameplay systems including actors, components, and game modes',
    overview: 'The Gameplay Framework provides the foundation for all interactive elements in Unreal Engine, including Actors (scene objects), Components (modular behaviors), Controllers (input and AI), Game Mode (rules), and Player Input systems.',
    keyFeatures: [
      {
        name: 'Actors, Components, Controllers',
        description: 'Core instantiable objects: Actors represent scene objects, Components attach for modular behaviors, Controllers manage input and autonomous actions',
        status: 'stable'
      },
      {
        name: 'Game Mode & Game State',
        description: 'Manage game rules, states, and flow across the game session',
        status: 'stable'
      },
      {
        name: 'Game Templates & Variants',
        description: 'Pre-built templates (First-Person, Third-Person, Top-Down, Vehicles) with variants like Survival Horror and Arena Shooter for faster prototyping',
        since: '5.6',
        status: 'stable'
      }
    ],
    bestPractices: [
      {
        title: 'Use Component-Based Architecture',
        description: 'Break functionality into reusable components rather than monolithic actors for better code reuse and maintainability',
        category: 'architecture'
      },
      {
        title: 'Separate Game Logic from Presentation',
        description: 'Keep game state in Game State and rules in Game Mode, separate from visual representation',
        category: 'architecture'
      }
    ],
    relatedSystems: ['gameplay-ability-system', 'ai-system', 'animation-system'],
    references: [
      {
        title: 'Gameplay Systems in Unreal Engine',
        url: 'https://dev.epicgames.com/documentation/en-us/unreal-engine/gameplay-systems-in-unreal-engine',
        type: 'official_docs'
      },
      {
        title: 'Updated game templates for Unreal Engine 5.6',
        url: 'https://www.unrealengine.com/en-US/news/updated-game-templates-for-unreal-engine-5-6available-now',
        type: 'article'
      }
    ],
    version: '5.0',
    tags: ['gameplay', 'actors', 'components', 'game-mode']
  },

  'rendering-system': {
    id: 'rendering-system',
    name: 'Rendering System',
    description: 'Advanced rendering technologies including Lumen, Nanite, and Virtual Shadow Maps',
    overview: 'Unreal Engine 5.6 features cutting-edge rendering systems: Lumen for dynamic global illumination, Nanite for virtualized geometry, and Virtual Shadow Maps for high-resolution shadows. These systems work together to deliver photorealistic visuals at 60 FPS.',
    keyFeatures: [
      {
        name: 'Lumen',
        description: 'Dynamic global illumination and reflection system with hybrid ray tracing pipeline. Supports both software and hardware ray tracing with real-time indirect lighting',
        since: '5.0',
        status: 'stable'
      },
      {
        name: 'Nanite',
        description: "Virtualized, instance-driven geometry solution enabling film-quality meshes at scale. Processes millions of triangles efficiently by streaming only what's visible",
        since: '5.0',
        status: 'stable'
      },
      {
        name: 'Virtual Shadow Maps (VSM)',
        description: 'Next-generation shadowing technology with virtual resolution up to 16k x 16k. Tiled shadow maps cache unchanged tiles between frames. Designed to work with Nanite geometry',
        since: '5.0',
        status: 'stable'
      },
      {
        name: 'Hardware Ray Tracing',
        description: 'GPU-accelerated ray tracing for highest accuracy in Lumen GI and reflections',
        since: '5.0',
        status: 'stable'
      }
    ],
    bestPractices: [
      {
        title: 'Enable All Three Systems Together',
        description: 'For best results, enable Lumen (dynamic GI), Nanite (complex geometry), and VSM (high-res shadows) together for scalable, real-time rendering',
        category: 'optimization'
      },
      {
        title: 'VSM Requires Nanite',
        description: 'Virtual Shadow Maps are nearly inseparable from Nanite in 5.6. VSM without Nanite falls back to Cascaded Shadow Maps and is not recommended except for simple scenes',
        category: 'workflow'
      },
      {
        title: 'Use Hardware Ray Tracing When Possible',
        description: 'For highest quality Lumen reflections and GI, enable hardware ray tracing if the target platform supports RT cores',
        category: 'optimization'
      }
    ],
    relatedSystems: ['core-architecture', 'material-system'],
    references: [
      {
        title: 'Virtual Shadow Maps in Unreal Engine',
        url: 'https://dev.epicgames.com/documentation/en-us/unreal-engine/virtual-shadow-maps-in-unreal-engine',
        type: 'official_docs'
      },
      {
        title: 'Unreal Engine 5.6 Performance Highlights',
        url: 'https://www.tomlooman.com/unreal-engine-5-6-performance-highlights/',
        type: 'article'
      },
      {
        title: 'Fixing Shadow Noise in Unreal Engine 5',
        url: 'https://prographers.com/blog/fixing-shadow-noise-in-unreal-engine-5-a-guideline-with-practical-tips-for-lumen-and-ray-tracing',
        type: 'article'
      }
    ],
    version: '5.0',
    tags: ['rendering', 'lumen', 'nanite', 'vsm', 'graphics', 'ray-tracing']
  },

  'animation-system': {
    id: 'animation-system',
    name: 'Animation System',
    description: 'Comprehensive animation framework including the new Unreal Animation Framework',
    overview: 'Unreal Engine 5.6 introduces major animation improvements including the experimental Unreal Animation Framework (UAF), enhanced Motion Trails, improved tween tools, and full MetaHuman authoring within the editor. These systems provide multi-threaded performance and streamlined workflows.',
    keyFeatures: [
      {
        name: 'Unreal Animation Framework (UAF)',
        description: 'Experimental successor to Animation Blueprint with multi-threaded performance, modularity, and deep Control Rig integration. Uses RigVM for high-performance scriptable animation logic',
        since: '5.6',
        status: 'experimental'
      },
      {
        name: 'Motion Trails',
        description: 'Overhauled visual, editable motion paths for animation. Allows direct manipulation of animation curves in the viewport',
        since: '5.6',
        status: 'stable'
      },
      {
        name: 'Tween Tools & Curve Editor',
        description: 'Improved interpolation tools and streamlined key adjustment for more efficient animation authoring',
        since: '5.6',
        status: 'stable'
      },
      {
        name: 'MetaHuman Integration',
        description: 'Full MetaHuman Creator integration within the editor, supporting realistic body creation and animation without external tools',
        since: '5.6',
        status: 'stable'
      },
      {
        name: 'Sequencer',
        description: 'Timeline-based cinematic and animation system for keyframes and complex sequences',
        since: '4.0',
        status: 'stable'
      },
      {
        name: 'Control Rig',
        description: 'Node-based rigging system for procedural animation and runtime character manipulation',
        since: '4.26',
        status: 'stable'
      }
    ],
    bestPractices: [
      {
        title: 'Consider UAF for New Projects',
        description: 'For new animation-heavy projects, evaluate the experimental Unreal Animation Framework for better performance and future-proofing',
        category: 'workflow'
      },
      {
        title: 'Use Motion Trails for Complex Paths',
        description: 'Leverage the new Motion Trails feature to visually edit and optimize complex character movement paths',
        category: 'workflow'
      },
      {
        title: 'Integrate Control Rig for Runtime',
        description: 'Use Control Rig for runtime procedural animations like IK, look-at, and dynamic adjustments',
        category: 'performance'
      }
    ],
    relatedSystems: ['gameplay-framework', 'metahuman-system'],
    references: [
      {
        title: 'Unreal Animation Framework (UAF) FAQ',
        url: 'https://dev.epicgames.com/community/learning/knowledge-base/nWWx/unreal-engine-unreal-animation-framework-uaf-faq',
        type: 'official_docs'
      },
      {
        title: "What's New With Unreal Engine 5.6 Animation Features",
        url: 'https://vagon.io/blog/what-s-new-with-unreal-engine-5-6-all-new-features-you-need-to-check-out',
        type: 'article'
      },
      {
        title: 'A First Look at the New Animation Features in Unreal Engine 5.6',
        url: 'https://www.youtube.com/watch?v=LtQWZQxGeXM',
        type: 'video'
      }
    ],
    version: '5.6',
    tags: ['animation', 'uaf', 'motion-trails', 'control-rig', 'sequencer', 'metahuman']
  },

  'physics-system': {
    id: 'physics-system',
    name: 'Physics System',
    description: 'Chaos Physics engine for realistic simulations including destruction and vehicles',
    overview: 'Unreal Engine uses the Chaos Physics engine for rigid body dynamics, cloth simulation, destruction, vehicles, and advanced collision detection. Version 5.6 introduces async physics streaming for better large-world performance.',
    keyFeatures: [
      {
        name: 'Chaos Physics Engine',
        description: 'Core physics engine for rigid body dynamics, cloth, hair, and destruction simulations',
        since: '4.26',
        status: 'stable'
      },
      {
        name: 'Async Physics Streaming',
        description: 'Asynchronous creation and destruction of physics states, improving large-world streaming performance',
        since: '5.6',
        status: 'stable'
      },
      {
        name: 'Collision & Raycast',
        description: 'Comprehensive collision detection and raycasting for gameplay interactions',
        status: 'stable'
      },
      {
        name: 'Cloth & Hair Physics',
        description: 'Dedicated subsystems for realistic cloth and hair simulation',
        since: '4.0',
        status: 'stable'
      },
      {
        name: 'Vehicle Physics',
        description: 'Specialized physics simulation for drivable vehicles with wheel dynamics',
        status: 'stable'
      }
    ],
    bestPractices: [
      {
        title: 'Use Simple Collision Shapes',
        description: 'Prefer simple collision primitives (box, sphere, capsule) over complex meshes for better performance',
        category: 'performance'
      },
      {
        title: 'Leverage Async Physics Streaming',
        description: 'In large open worlds, use the new async physics streaming to reduce hitches during level loading',
        category: 'optimization'
      },
      {
        title: 'Optimize Collision Channels',
        description: 'Configure collision channels carefully to avoid unnecessary collision checks',
        category: 'performance'
      }
    ],
    relatedSystems: ['gameplay-framework', 'rendering-system'],
    references: [
      {
        title: 'Unreal Engine 5.6 is now available',
        url: 'https://www.unrealengine.com/en-US/news/unreal-engine-5-6-is-now-available',
        type: 'article'
      }
    ],
    version: '5.0',
    tags: ['physics', 'chaos', 'collision', 'destruction', 'vehicles']
  },

  'ai-system': {
    id: 'ai-system',
    name: 'Artificial Intelligence',
    description: 'Comprehensive AI framework including Behavior Trees, State Trees, and navigation',
    overview: 'Unreal Engine provides a robust AI system with Behavior Trees for hierarchical decision-making, State Trees for state management, the Mass Entity System for crowds, navigation mesh generation, perception systems, and Smart Objects for dynamic world interactions.',
    keyFeatures: [
      {
        name: 'Behavior Trees',
        description: 'Hierarchical, node-based AI decision-making system for autonomous agent behavior',
        status: 'stable'
      },
      {
        name: 'State Trees',
        description: 'State machine system for managing AI states and transitions',
        since: '5.1',
        status: 'stable'
      },
      {
        name: 'Mass Entity System',
        description: 'Data-oriented framework for managing large populations of AI agents or crowd behavior efficiently',
        since: '5.0',
        status: 'stable'
      },
      {
        name: 'Navigation System',
        description: 'Automatic navigation mesh generation for AI pathfinding',
        status: 'stable'
      },
      {
        name: 'Perception Component',
        description: 'Sensory systems (sight, sound, etc.) for AI awareness',
        status: 'stable'
      },
      {
        name: 'Environment Query System (EQS)',
        description: 'Spatial reasoning system for contextual AI decision-making',
        status: 'stable'
      },
      {
        name: 'Smart Objects',
        description: 'Dynamic world interactions allowing AI to interact with objects contextually',
        since: '5.0',
        status: 'stable'
      }
    ],
    bestPractices: [
      {
        title: 'Use Mass Entity for Large Crowds',
        description: 'For crowds of 100+ agents, use the Mass Entity System instead of individual AI controllers for better performance',
        category: 'performance'
      },
      {
        title: 'Optimize Perception Queries',
        description: 'Configure perception component update frequencies based on importance to avoid performance issues',
        category: 'optimization'
      },
      {
        title: 'Leverage EQS for Complex Decisions',
        description: 'Use Environment Query System for spatial reasoning tasks like finding cover or positioning',
        category: 'workflow'
      }
    ],
    relatedSystems: ['gameplay-framework', 'navigation-system'],
    references: [
      {
        title: 'Gameplay Systems in Unreal Engine',
        url: 'https://dev.epicgames.com/documentation/en-us/unreal-engine/gameplay-systems-in-unreal-engine',
        type: 'official_docs'
      }
    ],
    version: '5.0',
    tags: ['ai', 'behavior-trees', 'navigation', 'perception', 'mass-entity']
  },

  'networking-system': {
    id: 'networking-system',
    name: 'Networking & Multiplayer',
    description: 'Replication system and multiplayer framework for networked games',
    overview: 'Unreal Engine 5.6 provides a comprehensive networking system with actor replication, RPCs, and the new Iris replication system for improved scalability. The authoritative server model ensures consistent game state across clients.',
    keyFeatures: [
      {
        name: 'Actor Replication',
        description: 'Automatic synchronization of actor state between server and clients. Actors can be marked as replicated to share their state across the network',
        status: 'stable'
      },
      {
        name: 'Remote Procedure Calls (RPCs)',
        description: 'Functions that execute across the network: Server, Client, and Multicast RPCs with optional reliable delivery',
        status: 'stable'
      },
      {
        name: 'Iris Replication System',
        description: 'Next-generation replication system replacing Replication Graph. Offers efficient data transfer, better scalability for large player counts, and flexible configuration',
        since: '5.0',
        status: 'stable'
      },
      {
        name: 'Replicated Properties',
        description: 'Individual variable replication with RepNotify callbacks for responsive updates',
        status: 'stable'
      },
      {
        name: 'Server Authority Model',
        description: 'Authoritative server validates all critical game actions with Autonomous and Simulated proxy support',
        status: 'stable'
      }
    ],
    bestPractices: [
      {
        title: 'Migrate to Iris for New Projects',
        description: 'Use the Iris replication system for new multiplayer projects to benefit from optimizations and future support',
        category: 'architecture'
      },
      {
        title: 'Validate Server-Side',
        description: 'Always validate critical gameplay events (health, items, victories) on the server to prevent cheating',
        category: 'security'
      },
      {
        title: 'Use Reliable Sparingly',
        description: 'Only use Reliable flag for critical game actions/events to avoid bandwidth issues',
        category: 'performance'
      },
      {
        title: 'Minimize Replicated Data',
        description: 'Only replicate essential data and use actor/network dormancy for efficiency',
        category: 'optimization'
      }
    ],
    relatedSystems: ['gameplay-framework', 'gameplay-ability-system'],
    references: [
      {
        title: 'Networking and Multiplayer in Unreal Engine',
        url: 'https://dev.epicgames.com/documentation/en-us/unreal-engine/networking-and-multiplayer-in-unreal-engine',
        type: 'official_docs'
      },
      {
        title: 'UE5 Multiplayer Replication Guide',
        url: 'https://github.com/droganaida/UE5-Multiplayer-Replication-Guide',
        type: 'github'
      },
      {
        title: 'Performing Lag Compensation in Unreal Engine 5',
        url: 'https://snapnet.dev/blog/performing-lag-compensation-in-unreal-engine-5/',
        type: 'article'
      }
    ],
    version: '5.0',
    tags: ['networking', 'multiplayer', 'replication', 'iris', 'rpc']
  },

  'audio-system': {
    id: 'audio-system',
    name: 'Audio System (MetaSounds)',
    description: 'Next-generation procedural audio system using MetaSounds',
    overview: 'MetaSounds is Unreal Engine\'s next-generation audio system providing DSP graph-based audio with sample-accurate control. It enables procedural and interactive sound design with real-time audio generation and node-based editing.',
    keyFeatures: [
      {
        name: 'DSP Graph-Based Audio',
        description: 'Node-based audio system with granular, sample-level control over sound generation, effects, and routing',
        since: '5.0',
        status: 'stable'
      },
      {
        name: 'Runtime Procedural Generation',
        description: 'Synthesize audio in real-time, trigger sounds from gameplay events, and mix procedurally generated effects',
        since: '5.0',
        status: 'stable'
      },
      {
        name: 'MetaSound Editor',
        description: 'Visual node-based tool for crafting and previewing sounds with interactive parameter adjustment',
        since: '5.0',
        status: 'stable'
      },
      {
        name: 'Sample-Accurate Control',
        description: 'Timing precision down to individual audio samples (1/48,000th of a second at 48 kHz)',
        since: '5.0',
        status: 'stable'
      },
      {
        name: 'Presets and Graph Reuse',
        description: 'Reusable graphs and presets for managing complexity and boosting productivity',
        since: '5.0',
        status: 'stable'
      },
      {
        name: 'Niagara & Blueprint Integration',
        description: 'Seamless integration with Niagara VFX and Blueprints for synchronized audio-visual experiences',
        since: '5.6',
        status: 'stable'
      }
    ],
    bestPractices: [
      {
        title: 'Migrate from Sound Cues',
        description: 'For new audio work, use MetaSounds instead of legacy Sound Cues for flexibility and future support',
        category: 'workflow'
      },
      {
        title: 'Organize MetaSound Graphs',
        description: 'Keep graphs organized and modular for easier debugging and reuse across projects',
        category: 'workflow'
      },
      {
        title: 'Sync Audio with VFX',
        description: 'Use Niagara + MetaSounds + Blueprints integration for perfectly synchronized reactive effects',
        category: 'workflow'
      }
    ],
    relatedSystems: ['niagara-system', 'gameplay-framework'],
    references: [
      {
        title: 'MetaSounds: The Next Generation Sound Sources in Unreal Engine',
        url: 'https://dev.epicgames.com/documentation/en-us/unreal-engine/metasounds-the-next-generation-sound-sources-in-unreal-engine',
        type: 'official_docs'
      },
      {
        title: 'Combining Niagara, MetaSounds & Blueprint',
        url: 'https://forums.unrealengine.com/t/community-tutorial-unreal-engine-5-6-combining-niagara-metasounds-blueprint-for-stunning-reactive-effects/2674936',
        type: 'tutorial'
      }
    ],
    version: '5.0',
    tags: ['audio', 'metasounds', 'sound', 'dsp', 'procedural']
  },

  'ui-system': {
    id: 'ui-system',
    name: 'UI System (UMG & Common UI)',
    description: 'User interface framework with UMG widgets and Common UI for cross-platform menus',
    overview: 'Unreal Engine provides comprehensive UI tools through UMG (Unreal Motion Graphics) for basic widgets and Common UI plugin for advanced, cross-platform interfaces with robust input handling and gamepad navigation.',
    keyFeatures: [
      {
        name: 'UMG (Unreal Motion Graphics)',
        description: 'Primary UI system supporting buttons, progress bars, sliders, lists, and custom widgets with Blueprint and C++ integration',
        since: '4.0',
        status: 'stable'
      },
      {
        name: 'Common UI Plugin',
        description: 'Advanced plugin for complex, multi-layered, cross-platform game UIs with gamepad-friendly navigation',
        since: '4.27',
        status: 'stable'
      },
      {
        name: 'CommonActivatableWidget',
        description: 'Manages input focus and interaction blocking for screens, dialogs, and popups',
        since: '4.27',
        status: 'stable'
      },
      {
        name: 'Input Routing',
        description: 'Centralized, flexible input management for gamepads, keyboard, and mouse with automatic input icon support',
        since: '4.27',
        status: 'stable'
      },
      {
        name: 'Style Data Assets',
        description: 'Decoupled visual styling from logic to share styles across menus and screens',
        since: '4.27',
        status: 'stable'
      },
      {
        name: 'MVVM Pattern Support',
        description: 'Model-View-ViewModel pattern for efficient data binding and UI updates',
        since: '5.1',
        status: 'stable'
      }
    ],
    bestPractices: [
      {
        title: 'Use Common UI for Cross-Platform',
        description: 'If targeting consoles or needing advanced navigation, use Common UI instead of basic UMG',
        category: 'workflow'
      },
      {
        title: 'Leverage MVVM for Complex UI',
        description: 'Use the MVVM pattern with Common Activatable Widgets for maintainable, data-driven interfaces',
        category: 'architecture'
      },
      {
        title: 'Avoid Canvas Panel Overuse',
        description: 'Use vertical/horizontal boxes, overlays, and size boxes instead of Canvas panels for better performance',
        category: 'performance'
      },
      {
        title: 'Localize with String Tables',
        description: 'Store all UI text in string tables for easy localization and updates',
        category: 'workflow'
      }
    ],
    relatedSystems: ['gameplay-framework', 'input-system'],
    references: [
      {
        title: 'Common UI Plugin for Advanced User Interfaces',
        url: 'https://dev.epicgames.com/documentation/en-us/unreal-engine/common-ui-plugin-for-advanced-user-interfaces-in-unreal-engine',
        type: 'official_docs'
      },
      {
        title: 'Handling UI navigation with MVVM and Common Activatable Widgets',
        url: 'https://dev.epicgames.com/community/learning/tutorials/ep4k/unreal-engine-handling-ui-navigation-with-mvvm-and-common-activatable-widgets',
        type: 'tutorial'
      },
      {
        title: 'UE5 - Common UI Guide: Complete Guide to Inputs & Widgets',
        url: 'https://www.youtube.com/watch?v=80flMwKhhcY',
        type: 'video'
      }
    ],
    version: '5.0',
    tags: ['ui', 'umg', 'common-ui', 'widgets', 'menus']
  },

  'niagara-system': {
    id: 'niagara-system',
    name: 'Niagara VFX System',
    description: 'Advanced particle and visual effects system',
    overview: 'Niagara is Unreal Engine\'s next-generation VFX system, replacing Cascade. It provides a modular, node-based approach to creating complex particle effects from fire and explosions to fluid simulations, with real-time performance optimization.',
    keyFeatures: [
      {
        name: 'Modular Emitter System',
        description: 'Mix and match modules for color, velocity, physics, and rendering to create custom VFX',
        since: '4.20',
        status: 'stable'
      },
      {
        name: 'GPU Simulation',
        description: 'Optimized for real-time with millions of particles using GPU acceleration',
        since: '4.20',
        status: 'stable'
      },
      {
        name: 'Niagara Fluids',
        description: 'FLIP liquid simulation, volumetric smoke, and force fields for realistic fluid effects',
        since: '5.0',
        status: 'stable'
      },
      {
        name: 'Visual Niagara Editor',
        description: 'Node-based editor with live preview and auto-recompilation for rapid iteration',
        since: '4.20',
        status: 'stable'
      },
      {
        name: 'Event-Driven Particles',
        description: 'Respond to gameplay events and trigger particles dynamically',
        since: '4.20',
        status: 'stable'
      }
    ],
    bestPractices: [
      {
        title: 'Minimize Emitter Count',
        description: 'Combine logic into fewer, well-designed emitters for 30-50% better performance',
        category: 'optimization'
      },
      {
        title: 'Use GPU Simulation for Large Effects',
        description: 'Enable GPU simulation for effects with thousands of particles',
        category: 'performance'
      },
      {
        title: 'Keep Materials Simple',
        description: 'Use simple materials on particles to maintain high frame rates',
        category: 'performance'
      },
      {
        title: 'Sync with MetaSounds',
        description: 'Integrate Niagara with MetaSounds for synchronized audio-visual effects',
        category: 'workflow'
      }
    ],
    relatedSystems: ['audio-system', 'rendering-system', 'gameplay-framework'],
    references: [
      {
        title: 'Particle Effects in Unreal Engine',
        url: 'https://dev.epicgames.com/documentation/en-us/unreal-engine/particle-effects-in-unreal-engine',
        type: 'official_docs'
      },
      {
        title: 'Complete Introduction to Niagara VFX System',
        url: 'https://www.youtube.com/watch?v=LG9cdHKRLKM',
        type: 'video'
      },
      {
        title: 'Complete Guide to Niagara VFX Optimization',
        url: 'https://morevfxacademy.com/complete-guide-to-niagara-vfx-optimization-in-unreal-engine/',
        type: 'article'
      }
    ],
    version: '5.0',
    tags: ['vfx', 'niagara', 'particles', 'effects', 'fluids']
  },

  'gameplay-ability-system': {
    id: 'gameplay-ability-system',
    name: 'Gameplay Ability System (GAS)',
    description: 'Framework for implementing abilities, attributes, and gameplay effects',
    overview: 'The Gameplay Ability System is a powerful, data-driven framework for building complex gameplay mechanics involving attributes (health, mana), abilities (skills, spells), and gameplay effects (damage, healing, buffs). Fully supports multiplayer replication.',
    keyFeatures: [
      {
        name: 'Ability System Component',
        description: 'Core component managing all abilities, effects, and attributes for an actor',
        status: 'stable'
      },
      {
        name: 'Attribute Sets',
        description: 'Define game attributes like Health, Mana, Shield with automatic replication and change callbacks',
        status: 'stable'
      },
      {
        name: 'Gameplay Abilities',
        description: 'Encapsulated, reusable ability logic for skills, attacks, and special actions',
        status: 'stable'
      },
      {
        name: 'Gameplay Effects',
        description: 'Modular effects for damage, healing, buffs, debuffs with duration, magnitude, and modifiers',
        status: 'stable'
      },
      {
        name: 'Gameplay Tags',
        description: 'Hierarchical tags for filtering, triggering, and managing abilities and effects',
        status: 'stable'
      },
      {
        name: 'Multiplayer Replication',
        description: 'Built-in replication support for all GAS components and networked gameplay',
        status: 'stable'
      }
    ],
    bestPractices: [
      {
        title: 'Use Gameplay Tags Extensively',
        description: 'Leverage the tag system to organize abilities, effects, and conditional logic',
        category: 'architecture'
      },
      {
        title: 'Bind Attribute Change Callbacks',
        description: 'Use OnAttributeChanged callbacks for responsive UI and gameplay updates',
        category: 'workflow'
      },
      {
        title: 'Validate on Server',
        description: 'Always validate ability execution and attribute changes on the server in multiplayer',
        category: 'security'
      },
      {
        title: 'Separate Attributes into Sets',
        description: 'Organize attributes into logical sets (e.g., HealthSet, ManaSet) for better management',
        category: 'architecture'
      }
    ],
    relatedSystems: ['gameplay-framework', 'networking-system'],
    references: [
      {
        title: 'Getting Started with GAS in Unreal Engine 5.6',
        url: 'https://dev.epicgames.com/community/learning/tutorials/d6DL/getting-started-with-the-gameplay-ability-system-gas-in-unreal-engine-5-6',
        type: 'tutorial'
      },
      {
        title: 'Gameplay Ability System Best Practices',
        url: 'https://dev.epicgames.com/community/learning/tutorials/DPpd/unreal-engine-gameplay-ability-system-best-practices-for-setup',
        type: 'tutorial'
      },
      {
        title: 'GAS Tutorial Series',
        url: 'https://www.youtube.com/watch?v=tSXuaRk2YQ8',
        type: 'video'
      }
    ],
    version: '4.24',
    tags: ['gameplay', 'gas', 'abilities', 'attributes', 'rpg']
  },

  'material-system': {
    id: 'material-system',
    name: 'Material System',
    description: 'Node-based material editor for photorealistic surfaces and effects',
    overview: 'The Material System provides a powerful node-based editor for creating photorealistic materials and visual effects. It supports physically-based rendering, complex shader networks, and runtime material instances.',
    keyFeatures: [
      {
        name: 'Material Editor',
        description: 'Node-based visual editor for creating complex material networks',
        status: 'stable'
      },
      {
        name: 'Physically-Based Rendering',
        description: 'PBR workflow with metallic, roughness, and specular inputs for realistic materials',
        status: 'stable'
      },
      {
        name: 'Material Instances',
        description: 'Runtime-editable instances of materials for dynamic appearance changes',
        status: 'stable'
      },
      {
        name: 'Material Functions',
        description: 'Reusable material node networks for consistent effects across materials',
        status: 'stable'
      }
    ],
    bestPractices: [
      {
        title: 'Use Material Instances',
        description: 'Create material instances instead of duplicating materials for better performance and memory',
        category: 'performance'
      },
      {
        title: 'Leverage Material Functions',
        description: 'Use material functions for complex, reusable logic like triplanar mapping or weathering',
        category: 'workflow'
      }
    ],
    relatedSystems: ['rendering-system'],
    references: [
      {
        title: 'Unreal Engine Material System',
        url: 'https://dev.epicgames.com/documentation/en-us/unreal-engine/materials-in-unreal-engine',
        type: 'official_docs'
      }
    ],
    version: '4.0',
    tags: ['materials', 'shaders', 'pbr', 'rendering']
  },

  'inventory-system': {
    id: 'inventory-system',
    name: 'Inventory & Crafting Systems',
    description: 'Component-based inventory systems with item management, crafting, and multiplayer replication',
    overview: 'Modern inventory systems in Unreal Engine use component-based architecture with ActorComponents for flexibility. Supports multiple inventory types (grid-based, slot-based, weight-based), item stacking, categories, crafting recipes, and robust multiplayer replication. Integration with Gameplay Ability System enables powerful item effects and equipment abilities.',
    keyFeatures: [
      {
        name: 'Component-Based Architecture',
        description: 'UInventoryComponent attached to any actor (player, NPC, chest, ship, station) for modular inventory management',
        since: '5.0',
        status: 'stable'
      },
      {
        name: 'Multiple Inventory Types',
        description: 'Grid-based (Diablo-style), slot-based (WoW-style), weight-based (Skyrim-style), or hybrid approaches',
        status: 'stable'
      },
      {
        name: 'Item Stacking and Categories',
        description: 'Stackable items with max stack sizes, categorization, filtering, and sorting for organized inventory',
        status: 'stable'
      },
      {
        name: 'Gameplay Ability System Integration',
        description: 'Item usage triggers GAS abilities, equipment grants passive effects, full multiplayer replication support',
        since: '5.0',
        status: 'stable'
      },
      {
        name: 'Crafting System',
        description: 'Recipe-based crafting with data tables, crafting stations, ingredient requirements, and queue management',
        status: 'stable'
      },
      {
        name: 'Multiplayer Replication',
        description: 'Server-authoritative inventory with FastArraySerializer, RepNotify, and secure validation',
        status: 'stable'
      },
      {
        name: 'Drag and Drop UI',
        description: 'UMG-based inventory UI with drag-drop operations, tooltips, and context menus',
        status: 'stable'
      },
      {
        name: 'Data-Driven Design',
        description: 'Item definitions in data tables with soft asset references for performance and designer accessibility',
        status: 'stable'
      }
    ],
    bestPractices: [
      {
        title: 'Use Component Composition Over Inheritance',
        description: 'Attach UInventoryComponent to actors instead of creating inventory-specific actor classes',
        category: 'architecture'
      },
      {
        title: 'Implement Layered Architecture',
        description: 'Separate data layer (item definitions), system layer (subsystems), instance layer (components), and integration layer (GAS)',
        category: 'architecture'
      },
      {
        title: 'Server-Authoritative Replication',
        description: 'All inventory changes validated and executed server-side, replicated to clients via RepNotify',
        category: 'security'
      },
      {
        title: 'Use Soft References for Assets',
        description: 'Store item icons and meshes as TSoftObjectPtr to avoid loading all assets at once',
        category: 'performance'
      },
      {
        title: 'Integrate with Gameplay Ability System',
        description: 'Use GAS for item abilities, equipment effects, and consumable actions for robust multiplayer support',
        category: 'workflow'
      },
      {
        title: 'Data Table Driven Items and Recipes',
        description: 'Store all item data and crafting recipes in data tables for easy balancing and designer iteration',
        category: 'workflow'
      },
      {
        title: 'Use Gameplay Tags for Item Categories',
        description: 'Leverage gameplay tags for flexible item categorization, filtering, and effect application',
        category: 'workflow'
      },
      {
        title: 'Optimize UI with Modular Widgets',
        description: 'Create reusable UMG widgets for slots, items, and tooltips with efficient update patterns',
        category: 'performance'
      }
    ],
    relatedSystems: ['gameplay-ability-system', 'gameplay-framework', 'ui-system', 'networking-system'],
    references: [
      {
        title: 'Building a Flexible Inventory System in UE5 with C++',
        url: 'https://www.spongehammer.com/unreal-engine-5-inventory-system-cpp-guide/',
        type: 'tutorial'
      },
      {
        title: 'How to Create an Inventory System in Unreal Engine 5',
        url: 'https://outscal.com/blog/how-to-create-an-inventory-system-in-unreal-engine-5',
        type: 'tutorial'
      },
      {
        title: 'Epic Community Inventory System Tutorial',
        url: 'https://dev.epicgames.com/community/learning/tutorials/V2J9/unreal-engine-inventory-system',
        type: 'tutorial'
      },
      {
        title: 'Getting Started with ForgeKeep (Advanced Inventory Plugin)',
        url: 'https://dev.epicgames.com/community/learning/tutorials/pBM0/unreal-engine-getting-started-with-forgekeep',
        type: 'tutorial'
      },
      {
        title: 'Creating Drag and Drop UI in Unreal Engine',
        url: 'https://dev.epicgames.com/documentation/en-us/unreal-engine/creating-drag-and-drop-ui-in-unreal-engine',
        type: 'official_docs'
      },
      {
        title: 'Adastrea Inventory System Research',
        url: 'https://github.com/Mittenzx/Adastrea-MCP/blob/main/INVENTORY_SYSTEM_RESEARCH.md',
        type: 'article'
      }
    ],
    version: '5.0',
    tags: ['gameplay', 'inventory', 'crafting', 'items', 'ui', 'multiplayer', 'gas', 'components']
  }
};

/**
 * Search the knowledge database by tags, system name, or keywords
 */
export function searchKnowledge(query: string): SystemCategory[] {
  const lowerQuery = query.toLowerCase();
  const results: SystemCategory[] = [];

  for (const system of Object.values(UnrealEngineKnowledge)) {
    // Search in name, description, and tags
    if (
      system.name.toLowerCase().includes(lowerQuery) ||
      system.description.toLowerCase().includes(lowerQuery) ||
      system.overview.toLowerCase().includes(lowerQuery) ||
      system.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      system.keyFeatures.some(feature => 
        feature.name.toLowerCase().includes(lowerQuery) ||
        feature.description.toLowerCase().includes(lowerQuery)
      )
    ) {
      results.push(system);
    }
  }

  return results;
}

/**
 * Get a specific system by ID
 */
export function getSystem(systemId: string): SystemCategory | undefined {
  return UnrealEngineKnowledge[systemId];
}

/**
 * Get all systems in a category (by tag)
 */
export function getSystemsByTag(tag: string): SystemCategory[] {
  const lowerTag = tag.toLowerCase();
  return Object.values(UnrealEngineKnowledge).filter(system =>
    system.tags.some(systemTag => systemTag.toLowerCase() === lowerTag)
  );
}

/**
 * Get all available tags
 */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const system of Object.values(UnrealEngineKnowledge)) {
    system.tags.forEach(tag => tags.add(tag));
  }
  return Array.from(tags).sort();
}

/**
 * Get systems related to a given system
 */
export function getRelatedSystems(systemId: string): SystemCategory[] {
  const system = UnrealEngineKnowledge[systemId];
  if (!system) return [];

  return system.relatedSystems
    .map(id => UnrealEngineKnowledge[id])
    .filter(s => s !== undefined);
}

/**
 * Get a summary of the entire knowledge base
 */
export function getKnowledgeSummary(): {
  totalSystems: number;
  systemsByVersion: Record<string, number>;
  allTags: string[];
  systemList: Array<{ id: string; name: string; version: string }>;
} {
  const systemList = Object.values(UnrealEngineKnowledge).map(s => ({
    id: s.id,
    name: s.name,
    version: s.version
  }));

  const systemsByVersion: Record<string, number> = {};
  for (const system of Object.values(UnrealEngineKnowledge)) {
    systemsByVersion[system.version] = (systemsByVersion[system.version] || 0) + 1;
  }

  return {
    totalSystems: Object.keys(UnrealEngineKnowledge).length,
    systemsByVersion,
    allTags: getAllTags(),
    systemList
  };
}
