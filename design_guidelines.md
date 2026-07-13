{
  "project": {
    "name": "West Bengal Indigenous Tribal Food Heritage — Deep Mapping (3D Map + Talking Tours)",
    "design_personality": {
      "keywords": [
        "museum-quality",
        "cinematic",
        "earthy",
        "tribal-modern fusion",
        "3D depth",
        "tactile terracotta",
        "forest-night glow",
        "research-friendly"
      ],
      "north_star": "Feels like a Google Arts & Culture experiment: immersive, calm, premium; map is the stage, UI is a curated exhibit layer.",
      "anti_goals": [
        "No generic centered landing-page layout",
        "No neon cyberpunk",
        "No purple gradients",
        "No transparent popups/panels (must read on any map style)"
      ]
    }
  },

  "typography": {
    "font_pairing": {
      "display": {
        "name": "Bricolage Grotesque",
        "fallback": "ui-sans-serif, system-ui",
        "usage": "Hero title, section titles, district/community names"
      },
      "body": {
        "name": "Hind Siliguri",
        "fallback": "ui-sans-serif, system-ui",
        "usage": "Body copy + Bengali support (BN). Use for UI labels to keep scripts consistent."
      },
      "devanagari": {
        "name": "Hind",
        "fallback": "ui-sans-serif, system-ui",
        "usage": "Hindi (HI) UI + narration text"
      },
      "mono": {
        "name": "IBM Plex Mono",
        "fallback": "ui-monospace, SFMono-Regular",
        "usage": "Coordinates, layer IDs, debug readouts"
      }
    },
    "loading_instructions": {
      "google_fonts": [
        "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Hind+Siliguri:wght@400;500;600;700&family=Hind:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
      ],
      "css_application": {
        "root": "--font-display, --font-body, --font-mono",
        "body": "font-family: var(--font-body);",
        "headings": "font-family: var(--font-display); letter-spacing: -0.02em;"
      }
    },
    "text_size_hierarchy": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl",
      "h2": "text-base md:text-lg",
      "body": "text-sm md:text-base",
      "small": "text-xs"
    },
    "type_rules": [
      "Use slightly tighter tracking for English headings (tracking-[-0.02em])",
      "For Bengali/Hindi, avoid excessive tracking; keep leading relaxed (leading-6/7) for readability",
      "Numbers/coordinates use mono"
    ]
  },

  "color_system": {
    "notes": [
      "Earthy terracotta + forest palette with a dark immersive base so glowing markers pop.",
      "Gradients only as subtle section overlays (<=20% viewport).",
      "Popups/panels are SOLID (no transparency) with tactile shadows."
    ],
    "tokens_css": ":root {\n  --bg: 24 18% 7%;            /* soot-brown */\n  --fg: 30 33% 96%;          /* bone */\n\n  --card: 28 22% 10%;        /* kiln-black */\n  --card-2: 26 18% 12%;      /* deeper panel */\n  --card-fg: 30 33% 96%;\n\n  --muted: 26 14% 18%;\n  --muted-fg: 28 12% 72%;\n\n  --border: 26 14% 22%;\n  --ring: 28 55% 62%;        /* terracotta glow ring */\n\n  --primary: 22 62% 52%;     /* terracotta */\n  --primary-fg: 30 33% 96%;\n\n  --secondary: 145 28% 26%;  /* forest */\n  --secondary-fg: 30 33% 96%;\n\n  --accent: 44 72% 56%;      /* turmeric */\n  --accent-fg: 24 18% 7%;\n\n  --info: 196 44% 46%;       /* river teal */\n  --success: 146 42% 38%;\n  --warning: 44 72% 56%;\n  --danger: 6 62% 52%;\n\n  --shadow-1: 0 10px 30px rgba(0,0,0,.45);\n  --shadow-2: 0 18px 60px rgba(0,0,0,.55);\n  --radius-lg: 18px;\n  --radius-md: 14px;\n  --radius-sm: 10px;\n}\n",
    "community_palette": {
      "usage": "Legend chips + marker glow halo per community (16). Keep hues earthy; avoid neon.",
      "colors": {
        "Toto": "#D07A3A",
        "Santal": "#C65A3A",
        "Oraon": "#2F6B4F",
        "Rajbanshi": "#2E6F7A",
        "Lodha": "#8A6A3B",
        "KheriaSabar": "#7A3E2E",
        "Lepcha": "#3E6A5B",
        "BhutiaSherpa": "#3B5E8A",
        "Munda": "#6B4E2F",
        "Bhumij": "#4F6B2F",
        "Ho": "#7A5A2E",
        "Garo": "#2F5B6B",
        "Mech": "#6B2F4A",
        "Rava": "#5B6B2F",
        "Dukpa": "#2F4A6B",
        "Others": "#6B6B6B"
      }
    },
    "allowed_gradients": {
      "hero_overlay": "radial-gradient(1200px circle at 20% 10%, rgba(198,90,58,.22), transparent 55%), radial-gradient(900px circle at 80% 20%, rgba(46,111,122,.18), transparent 60%)",
      "map_vignette": "radial-gradient(900px circle at 50% 40%, transparent 40%, rgba(0,0,0,.55) 100%)"
    },
    "texture": {
      "noise_overlay_css": ".noise::before{content:'';position:absolute;inset:0;background-image:url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"160\" height=\"160\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"3\" stitchTiles=\"stitch\"/></filter><rect width=\"160\" height=\"160\" filter=\"url(%23n)\" opacity=\"0.08\"/></svg>');mix-blend-mode:overlay;pointer-events:none;}"
    }
  },

  "layout": {
    "app_shell": {
      "structure": [
        "Full-viewport MapLibre canvas",
        "Top bar (language + search + snapshot)",
        "Left collapsible filter/legend panel",
        "Right detail drawer (food entry + 13-layer tabs + origin narrative)",
        "Bottom-right music player widget",
        "Full-screen Talking Tour overlay mode"
      ],
      "grid": {
        "desktop": "12-col overlay grid; left panel spans 3-4 cols, right drawer spans 4 cols",
        "mobile": "Single column overlays: top bar + bottom sheet drawers"
      },
      "spacing": {
        "rule": "Use 2–3x more spacing than feels comfortable.",
        "tokens": {
          "--space-1": "4px",
          "--space-2": "8px",
          "--space-3": "12px",
          "--space-4": "16px",
          "--space-5": "24px",
          "--space-6": "32px"
        }
      }
    },
    "responsive_patterns": [
      "Left panel becomes a Sheet (shadcn) on mobile with a floating ‘Filters’ button",
      "Right detail drawer becomes Drawer (bottom) on mobile; tabs remain horizontal scroll",
      "Talking Tour overlay uses full-screen with bottom controls; transcript scroll area"
    ]
  },

  "components": {
    "component_path": {
      "button": "/app/frontend/src/components/ui/button.jsx",
      "card": "/app/frontend/src/components/ui/card.jsx",
      "tabs": "/app/frontend/src/components/ui/tabs.jsx",
      "drawer": "/app/frontend/src/components/ui/drawer.jsx",
      "sheet": "/app/frontend/src/components/ui/sheet.jsx",
      "scroll_area": "/app/frontend/src/components/ui/scroll-area.jsx",
      "accordion": "/app/frontend/src/components/ui/accordion.jsx",
      "badge": "/app/frontend/src/components/ui/badge.jsx",
      "tooltip": "/app/frontend/src/components/ui/tooltip.jsx",
      "popover": "/app/frontend/src/components/ui/popover.jsx",
      "hover_card": "/app/frontend/src/components/ui/hover-card.jsx",
      "select": "/app/frontend/src/components/ui/select.jsx",
      "switch": "/app/frontend/src/components/ui/switch.jsx",
      "slider": "/app/frontend/src/components/ui/slider.jsx",
      "separator": "/app/frontend/src/components/ui/separator.jsx",
      "dialog": "/app/frontend/src/components/ui/dialog.jsx",
      "sonner_toast": "/app/frontend/src/components/ui/sonner.jsx",
      "skeleton": "/app/frontend/src/components/ui/skeleton.jsx",
      "calendar": "/app/frontend/src/components/ui/calendar.jsx"
    },
    "buttons": {
      "style": "Professional/Museum: medium radius, tactile shadow, subtle hover glow",
      "variants": {
        "primary": "bg-[hsl(var(--primary))] text-[hsl(var(--primary-fg))] shadow-[var(--shadow-1)] hover:brightness-[1.05] focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
        "secondary": "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-fg))] hover:brightness-[1.06]",
        "ghost": "bg-transparent text-[hsl(var(--fg))] hover:bg-[hsl(var(--muted))]"
      },
      "micro_interaction": "On press: scale-[0.98] (only on button), transition-[background-color,box-shadow,filter] duration-200"
    },
    "map_popup_card": {
      "goal": "3D-looking popup with solid background, depth shadow, and a carved border motif.",
      "spec": {
        "container": "rounded-[18px] bg-[hsl(var(--card))] text-[hsl(var(--card-fg))] shadow-[var(--shadow-2)] border border-[hsl(var(--border))]",
        "header": "flex items-start justify-between gap-3",
        "title": "font-[var(--font-display)] text-base",
        "meta": "text-xs text-[hsl(var(--muted-fg))]",
        "accent_rule": "Add a 3px left border strip in community color + tiny Warli/Santal icon stamp"
      },
      "data_testids": {
        "popup_root": "map-marker-popup",
        "open_detail": "map-marker-popup-open-detail-button",
        "play_tour": "map-marker-popup-play-tour-button"
      }
    },
    "left_filter_panel": {
      "desktop": "Fixed overlay panel with Collapsible sections (Layers, Communities, Districts, Trails)",
      "mobile": "Sheet component",
      "controls": [
        "Search (Command component) for food/community/district",
        "Layer toggles (Switch) with icon + short label",
        "Community legend chips (Badge) selectable",
        "Opacity slider for thematic overlays"
      ],
      "data_testids": {
        "filters_open": "filters-open-button",
        "filters_search": "filters-search-input",
        "filters_layer_toggle": "filters-layer-toggle",
        "filters_community_chip": "filters-community-chip"
      }
    },
    "right_detail_drawer": {
      "component": "Drawer (desktop can be a side panel div; mobile uses Drawer bottom)",
      "content": [
        "Hero image strip (solid) + title",
        "Tabs: 13 knowledge layers",
        "Origin narrative (Layer 14) as a separate tab or accordion",
        "CTA row: Start Talking Tour, Add to Trail, Share Snapshot"
      ],
      "data_testids": {
        "detail_drawer": "food-detail-drawer",
        "detail_tabs": "food-detail-tabs",
        "start_tour": "food-detail-start-talking-tour-button"
      }
    },
    "talking_tour_overlay": {
      "visual": "Full-screen cinematic overlay with subtle imagery background + vignette + transcript card",
      "components": [
        "Card for transcript",
        "Progress for narration progress",
        "Tabs for EN/BN/HI",
        "Buttons: Play/Pause, Replay, Snapshot, Ask Question"
      ],
      "word_highlighting": "As audio plays, highlight current word with background accent (turmeric at 20% opacity).",
      "data_testids": {
        "tour_overlay": "talking-tour-overlay",
        "tour_play": "talking-tour-play-button",
        "tour_pause": "talking-tour-pause-button",
        "tour_snapshot": "talking-tour-snapshot-button",
        "tour_language": "talking-tour-language-toggle"
      }
    },
    "snapshot_panel": {
      "pattern": "Dialog or Drawer with results: descriptive script + audio controls + 5 questions",
      "components": [
        "Dialog",
        "ScrollArea",
        "Accordion for questions",
        "Button to regenerate"
      ],
      "data_testids": {
        "snapshot_button": "snapshot-button",
        "snapshot_dialog": "snapshot-results-dialog",
        "snapshot_questions": "snapshot-pedagogical-questions"
      }
    },
    "music_player_widget": {
      "placement": "bottom-right floating card",
      "controls": [
        "Play/Pause",
        "Track select per community",
        "Volume slider"
      ],
      "data_testids": {
        "music_player": "tribal-music-player",
        "music_play": "tribal-music-play-button",
        "music_volume": "tribal-music-volume-slider"
      }
    }
  },

  "map_visual_design": {
    "map_style": {
      "base": "Dark earthy vector style (soot-brown) with muted roads; water in river-teal; labels in bone.",
      "terrain": "Enable 3D terrain with exaggeration ~2.0–2.8; keep hillshade subtle.",
      "tilt": "Default pitch 65–70, bearing slight (10–18deg) for cinematic depth. maxPitch 85."
    },
    "markers": {
      "look": "Glowing pin + tribal icon stamp (Warli/Santal-inspired line art) inside a terracotta medallion.",
      "halo": "Community color outer glow (box-shadow like 0 0 0 6px rgba(color,.18), 0 0 24px rgba(color,.35))",
      "cluster": "Use clustered circles with carved ring border; show count in mono"
    },
    "layers": {
      "icons": "Create a consistent icon set: 1.5px stroke, rounded caps, minimal fill; inspired by Warli motifs (triangles, dots, stick figures) but abstracted.",
      "layer_icon_examples": {
        "ecology": "leaf + river line",
        "community": "group circle motif",
        "ingredients": "grain + chili",
        "culinary_technology": "pot + steam",
        "temporal": "sun/moon",
        "folklore": "drum",
        "lost_traditions": "broken ring",
        "sacred_foods": "altar flame",
        "medicinal": "herb cross",
        "cultural_significance": "woven pattern",
        "origins": "spiral path"
      }
    },
    "cinematic_intro": {
      "sequence": [
        "Start on India (zoom ~4), low pitch",
        "Glow outline of West Bengal (animated stroke-dashoffset)",
        "FlyTo West Bengal (zoom ~6.5), increase pitch",
        "Then district focus (zoom ~8–9) with markers fading in"
      ],
      "motion": "Use Framer Motion for overlay text + MapLibre flyTo easing (easeInOutCubic)."
    }
  },

  "motion": {
    "principles": [
      "Cinematic, not bouncy",
      "Use opacity + translateY small distances (6–12px)",
      "Avoid global transition: all"
    ],
    "durations": {
      "fast": "150–200ms",
      "standard": "240–320ms",
      "cinematic": "700–1200ms"
    },
    "micro_interactions": [
      "Marker hover: halo intensifies + slight scale (1.03) on marker element only",
      "Panel open: slide + fade",
      "Tabs switch: underline glides (layoutId in Framer Motion)",
      "Snapshot button: subtle pulse ring (2 cycles) after click"
    ],
    "libraries": {
      "framer_motion": {
        "install": "npm i framer-motion",
        "usage": "Intro overlay, panel transitions, tab underline, subtle parallax on background images"
      }
    }
  },

  "accessibility": {
    "rules": [
      "WCAG AA contrast for text on panels",
      "Visible focus rings using --ring",
      "Respect prefers-reduced-motion: disable cinematic flyTo + reduce animations",
      "Keyboard navigation: panels, tabs, dialogs must be reachable",
      "Provide aria-labels for icon-only controls (play/pause, snapshot)"
    ],
    "language_support": [
      "Ensure BN/HI fonts loaded; avoid all-caps for BN/HI",
      "Language toggle must be persistent and obvious"
    ]
  },

  "image_urls": {
    "backgrounds": [
      {
        "category": "talking-tour-background",
        "description": "Moody forest canopy backdrop (apply heavy vignette + blur 2px behind transcript card)",
        "url": "https://images.unsplash.com/photo-1650173287237-953c9b54528c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHw0fHxmb3Jlc3QlMjBjYW5vcHklMjBpbmRpYSUyMG1vb2R5fGVufDB8fHxncmVlbnwxNzgzOTgxNzc3fDA&ixlib=rb-4.1.0&q=85"
      },
      {
        "category": "talking-tour-background",
        "description": "Forest path texture for alternate tour scenes",
        "url": "https://images.unsplash.com/photo-1618756501529-a591ffb93392?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjBjYW5vcHklMjBpbmRpYSUyMG1vb2R5fGVufDB8fHxncmVlbnwxNzgzOTgxNzc3fDA&ixlib=rb-4.1.0&q=85"
      }
    ],
    "textures": [
      {
        "category": "panel-texture",
        "description": "Terracotta tile texture for subtle header strip (use at 6–10% opacity, multiply blend)",
        "url": "https://images.unsplash.com/photo-1580026926593-14aba6c81e65?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHwxfHx0ZXJyYWNvdHRhJTIwcG90dGVyeSUyMHRleHR1cmV8ZW58MHx8fG9yYW5nZXwxNzgzOTgxNzgzfDA&ixlib=rb-4.1.0&q=85"
      },
      {
        "category": "panel-texture",
        "description": "Terracotta plaster wall for subtle noise/texture overlay",
        "url": "https://images.unsplash.com/photo-1588600209371-fbbd82462a36?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHwyfHx0ZXJyYWNvdHRhJTIwcG90dGVyeSUyMHRleHR1cmV8ZW58MHx8fG9yYW5nZXwxNzgzOTgxNzgzfDA&ixlib=rb-4.1.0&q=85"
      }
    ]
  },

  "extra_libraries": {
    "map": {
      "maplibre_gl": {
        "notes": "Use MapLibre GL JS with terrain + pitch for 3D. Consider deck.gl for advanced overlays if needed.",
        "recommended": [
          "maplibre-gl",
          "@deck.gl/mapbox (optional)",
          "three (optional for 3D models)"
        ]
      }
    },
    "audio": {
      "web_speech_api": {
        "notes": "Use SpeechSynthesis for EN/BN/HI fallback; if using server TTS, keep UI identical.",
        "ui": "Transcript word highlighting driven by timestamps (mock if needed)."
      }
    }
  },

  "instructions_to_main_agent": [
    "Replace default shadcn tokens in /app/frontend/src/index.css with the provided earthy dark tokens (keep structure).",
    "Do NOT use transparent backgrounds for popups/panels; always use solid card colors.",
    "Implement cinematic intro overlay + India→WB→district flyTo sequence; ensure prefers-reduced-motion disables it.",
    "All interactive elements must include data-testid (kebab-case).",
    "Use shadcn Sheet for mobile filters and Drawer for mobile details; desktop can be fixed panels.",
    "Use Framer Motion for overlay transitions; avoid transition: all.",
    "Ensure fonts load and BN/HI render well (Hind Siliguri + Hind).",
    "Markers: use community color halo + tribal icon stamp; cluster for performance."
  ],

  "general_ui_ux_design_guidelines": "<General UI UX Design Guidelines>\n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
