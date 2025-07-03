// src/data/sportStats.ts

export const sportStatsMap: Record<string, any> = {
    Badminton: {
      icon: "🏸",
      title: "Badminton",
      funFact: "The fastest badminton smash reached 306 mph—making it the world’s fastest racquet sport.",
      stats: [
        { label: "Matches Played", value: 18 },
        { label: "Best Rally Streak", value: 41 },
        { label: "Smash Speed PB", value: 172, unit: "mph" }
      ],
      badge: "Shuttle Master",
      tip: "Work on footwork drills for quicker recovery between shots.",
      tips: [
        "Switch up serves to keep opponents guessing.",
        "Stay low and on your toes for lightning-quick reactions."
      ]
    },
    Baseball: {
      icon: "⚾",
      title: "Baseball",
      funFact: "Japan and the Dominican Republic are baseball-obsessed countries, rivaling the U.S. in talent and passion.",
      stats: [
        { label: "Games Played", value: 14 },
        { label: "Home Runs Hit", value: 3 },
        { label: "Batting Avg.", value: 0.267 }
      ],
      badge: "Diamond Pro",
      tip: "Visualize each pitch and anticipate the ball’s trajectory.",
      tips: [
        "Keep your glove low—most errors are grounders.",
        "Eye on the ball, even off the field."
      ]
    },
    Basketball: {
      icon: "🏀",
      title: "Basketball",
      funFact: "The original hoops were peach baskets, and players used a soccer ball!",
      stats: [
        { label: "Games Played", value: 22 },
        { label: "Shooting %", value: 47, unit: "%" },
        { label: "Highest Points in Game", value: 28 }
      ],
      badge: "Court Visionary",
      tip: "Strong defense leads to easy offense.",
      tips: [
        "Practice free throws after every workout.",
        "Box out for rebounds, not just shots."
      ]
    },
    Boxing: {
      icon: "🥊",
      title: "Boxing",
      funFact: "Boxing gloves were first used in 1743—before that, bare knuckles ruled.",
      stats: [
        { label: "Bouts Fought", value: 7 },
        { label: "KO Ratio", value: 43, unit: "%" },
        { label: "Rounds Survived", value: 37 }
      ],
      badge: "Ring Warrior",
      tip: "Always protect your chin and keep your hands up.",
      tips: [
        "Footwork drills build both offense and defense.",
        "Shadowbox before every session."
      ]
    },
    Cheerleading: {
      icon: "📣",
      title: "Cheerleading",
      funFact: "Started as an all-male sport in the 1880s—now 97% female in the U.S.",
      stats: [
        { label: "Routines Performed", value: 12 },
        { label: "Stunts Mastered", value: 9 },
        { label: "Competition Wins", value: 2 }
      ],
      badge: "Spirit Leader",
      tip: "Practice landing technique as much as the stunt.",
      tips: [
        "Strong core equals safer tumbling.",
        "Smile—energy is contagious."
      ]
    },
    Cricket: {
      icon: "🏏",
      title: "Cricket",
      funFact: "Test matches can last five days—and sometimes still end in a draw!",
      stats: [
        { label: "Innings Played", value: 17 },
        { label: "Wickets Taken", value: 23 },
        { label: "Runs Scored", value: 312 }
      ],
      badge: "Century Club",
      tip: "Footwork and patience are as important as power.",
      tips: [
        "Eyes on the seam for swing bowlers.",
        "Rotate strike to keep bowlers off rhythm."
      ]
    },
    Cycling: {
      icon: "🚴",
      title: "Cycling",
      funFact: "The Tour de France covers more than 2,000 miles every year.",
      stats: [
        { label: "Miles Ridden", value: 134, goal: 200, unit: "mi" },
        { label: "Longest Ride", value: 54, unit: "mi" },
        { label: "Avg. Speed", value: 17.5, unit: "mph" }
      ],
      badge: "Road Warrior",
      tip: "Always stretch your hips and calves after rides.",
      tips: [
        "Check tire pressure before every ride.",
        "Vary your route for better training."
      ]
    },
    "E-Sports": {
      icon: "🎮",
      title: "E-Sports",
      funFact: "First e-sports tourney (1972) was for 'Spacewar!'—prize: a Rolling Stone subscription.",
      stats: [
        { label: "Tournaments Entered", value: 5 },
        { label: "Win Rate", value: 57, unit: "%" },
        { label: "Longest Session", value: 8, unit: "hrs" }
      ],
      badge: "Game Changer",
      tip: "Set time limits and hydrate—your brain needs breaks.",
      tips: [
        "Play with headphones for better focus.",
        "Analyze your replays for improvement."
      ]
    },
    Football: {
      icon: "🏈",
      title: "Football",
      funFact: "The NFL’s Super Bowl is watched by 100M+ people every year.",
      stats: [
        { label: "Games Played", value: 10 },
        { label: "Touchdowns", value: 8 },
        { label: "Longest Rush", value: 62, unit: "yds" }
      ],
      badge: "Gridiron Great",
      tip: "Master your footwork to gain an edge on every snap.",
      tips: [
        "Always warm up your hamstrings.",
        "Film study is as important as fieldwork."
      ]
    },
    Golf: {
      icon: "⛳",
      title: "Golf",
      funFact: "St. Andrews (Scotland) is considered the ‘home of golf’ since the 1400s.",
      stats: [
        { label: "Rounds Played", value: 7 },
        { label: "Best Score", value: 78 },
        { label: "Birdies", value: 4 }
      ],
      badge: "Greens Keeper",
      tip: "Focus on short game for lower scores.",
      tips: [
        "Visualize each shot before your swing.",
        "Replace your divots!"
      ]
    },
    "Ice Hockey": {
      icon: "🏒",
      title: "Ice Hockey",
      funFact: "The Stanley Cup has its own bodyguards during playoffs.",
      stats: [
        { label: "Games Played", value: 11 },
        { label: "Goals Scored", value: 15 },
        { label: "Assists", value: 10 }
      ],
      badge: "Ice King",
      tip: "Sharp skates = sharp plays. Sharpen blades regularly.",
      tips: [
        "Glide, don’t stomp, for faster acceleration.",
        "Always keep your head up!"
      ]
    },
    "Ice Skating": {
      icon: "⛸️",
      title: "Ice Skating",
      funFact: "First skates (5,000+ years ago) were made from animal bones.",
      stats: [
        { label: "Sessions Logged", value: 14 },
        { label: "Jumps Mastered", value: 4 },
        { label: "Personal Best Spin", value: "18 sec" }
      ],
      badge: "Spin Master",
      tip: "Balance drills off-ice improve your time on the ice.",
      tips: [
        "Warm up ankles and hips before skating.",
        "Smile for the judges (and photos)."
      ]
    },
    MMA: {
      icon: "🥋",
      title: "MMA",
      funFact: "Modern MMA debuted in the U.S. with UFC 1 in 1993.",
      stats: [
        { label: "Fights", value: 9 },
        { label: "Submission Wins", value: 3 },
        { label: "KO Wins", value: 2 }
      ],
      badge: "Octagon Warrior",
      tip: "Cross-train in both grappling and striking.",
      tips: [
        "Condition your core and neck.",
        "Always respect your tapout limit."
      ]
    },
    Pickleball: {
      icon: "🥒",
      title: "Pickleball",
      funFact: "Named after the family dog, Pickles, not the food!",
      stats: [
        { label: "Matches Played", value: 18 },
        { label: "Longest Win Streak", value: 7 },
        { label: "Paddles Owned", value: 3 }
      ],
      badge: "Court Commander",
      tip: "Work on your ‘dink’—it’s the most underrated shot.",
      tips: [
        "Control the kitchen, win the match.",
        "Try different grips for more spin."
      ]
    },
    Rugby: {
      icon: "🏉",
      title: "Rugby",
      funFact: "Legend says rugby started when a player picked up the ball in a soccer match.",
      stats: [
        { label: "Games Played", value: 8 },
        { label: "Tries Scored", value: 5 },
        { label: "Tackles Made", value: 29 }
      ],
      badge: "Scrum Machine",
      tip: "Low tackles are safer and more effective.",
      tips: [
        "Keep your head up in scrums.",
        "Pass before contact for open field runs."
      ]
    },
    Running: {
      icon: "🏃‍♂️",
      title: "Running",
      funFact: "Eliud Kipchoge ran the first sub-2-hour marathon in 2019.",
      stats: [
        { label: "Miles Logged", value: 104, goal: 150, unit: "mi" },
        { label: "Fastest 5K", value: "19:33" },
        { label: "Avg. Pace", value: "8:23", unit: "min/mi" }
      ],
      badge: "Endurance Pro",
      tip: "Replace shoes every 300-400 miles for injury prevention.",
      tips: [
        "Run easy days slower for faster race times.",
        "Consistency > speed workouts."
      ]
    },
    Skateboarding: {
      icon: "🛹",
      title: "Skateboarding",
      funFact: "Started as ‘sidewalk surfing’ in 1950s California.",
      stats: [
        { label: "Tricks Landed", value: 18 },
        { label: "Longest Ollie", value: "29 in" },
        { label: "Wipeouts Survived", value: 31 }
      ],
      badge: "Street Artist",
      tip: "Wear a helmet—seriously.",
      tips: [
        "Film your sessions to analyze form.",
        "Skate new spots for more creativity."
      ]
    },
    Skiing: {
      icon: "⛷️",
      title: "Skiing",
      funFact: "Ancient skis date back over 8,000 years to Russia and Scandinavia.",
      stats: [
        { label: "Runs Logged", value: 25 },
        { label: "Longest Vertical Drop", value: 2800, unit: "ft" },
        { label: "Fastest Speed", value: 46, unit: "mph" }
      ],
      badge: "Slope Pro",
      tip: "Edge control is the secret to safe speed.",
      tips: [
        "Warm up before hitting steep slopes.",
        "Wax your skis regularly for smooth glides."
      ]
    },
    Snowboarding: {
      icon: "🏂",
      title: "Snowboarding",
      funFact: "Became an Olympic sport in 1998.",
      stats: [
        { label: "Runs Completed", value: 20 },
        { label: "Biggest Air", value: "13 ft" },
        { label: "Boards Owned", value: 2 }
      ],
      badge: "Powder Hound",
      tip: "Practice switch riding for full control.",
      tips: [
        "Keep your weight centered to avoid catching edges.",
        "Try freestyle for new skills."
      ]
    },
    Soccer: {
      icon: "⚽",
      title: "Soccer",
      funFact: "The World Cup is the most-watched sporting event globally.",
      stats: [
        { label: "Games Played", value: 20 },
        { label: "Goals Scored", value: 11 },
        { label: "Assists", value: 7 }
      ],
      badge: "Field Maestro",
      tip: "Passing accuracy wins more games than fancy dribbling.",
      tips: [
        "Play pickup for real-world creativity.",
        "Practice weak-foot shots weekly."
      ]
    },
    Surfing: {
      icon: "🏄‍♂️",
      title: "Surfing",
      funFact: "Hawaiian royalty surfed wooden boards up to 16 feet long.",
      stats: [
        { label: "Waves Ridden", value: 34 },
        { label: "Longest Session", value: 2, unit: "hrs" },
        { label: "Biggest Wave", value: "8 ft" }
      ],
      badge: "Wave Rider",
      tip: "Learn to read the tide charts before paddling out.",
      tips: [
        "Duck dive early to avoid wipeouts.",
        "Keep your eyes on the horizon for better balance."
      ]
    },
    Swimming: {
      icon: "🏊‍♂️",
      title: "Swimming",
      funFact: "Michael Phelps has won more Olympic medals than 80 countries.",
      stats: [
        { label: "Laps Swum", value: 420, goal: 500 },
        { label: "Fastest 100m", value: "1:13" },
        { label: "Strokes Mastered", value: 4 }
      ],
      badge: "Aqua Ace",
      tip: "Work on technique, not just speed—form wins races.",
      tips: [
        "Alternate strokes to avoid overuse injuries.",
        "Kick from your hips, not knees."
      ]
    },
    Tennis: {
      icon: "🎾",
      title: "Tennis",
      funFact: "Wimbledon is the world’s oldest tennis tournament (since 1877).",
      stats: [
        { label: "Matches Played", value: 16 },
        { label: "Aces Hit", value: 27 },
        { label: "Longest Rally", value: 19 }
      ],
      badge: "Baseline Boss",
      tip: "Master the serve to dictate the point.",
      tips: [
        "Split-step before every return.",
        "Practice volleys to control the net."
      ]
    },
    Volleyball: {
      icon: "🏐",
      title: "Volleyball",
      funFact: "Invented as 'Mintonette' in 1895 before getting its current name.",
      stats: [
        { label: "Games Played", value: 13 },
        { label: "Aces Served", value: 12 },
        { label: "Blocks", value: 7 }
      ],
      badge: "Net Dominator",
      tip: "Strong communication = strong defense.",
      tips: [
        "Rotate positions to round out your skills.",
        "Practice setting with soft hands."
      ]
    },
    "Weight Training": {
      icon: "🏋️‍♂️",
      title: "Weight Training",
      funFact: "Olympic weightlifting has been part of the Games since 1896.",
      stats: [
        { label: "Workouts Logged", value: 33, goal: 50 },
        { label: "Max Bench Press", value: 235, unit: "lbs" },
        { label: "Total PRs", value: 8 }
      ],
      badge: "Iron Addict",
      tip: "Track your sets—progress is built on numbers.",
      tips: [
        "Form first, weight second.",
        "Rest is as vital as work."
      ]
    },
    Wrestling: {
      icon: "🤼",
      title: "Wrestling",
      funFact: "One of the oldest sports—featured in the original Olympics.",
      stats: [
        { label: "Matches Fought", value: 10 },
        { label: "Pins", value: 6 },
        { label: "Takedowns", value: 21 }
      ],
      badge: "Mat Technician",
      tip: "Use leverage, not just strength.",
      tips: [
        "Work on grip strength weekly.",
        "Study different wrestling styles."
      ]
    },
    Yoga: {
      icon: "🧘",
      title: "Yoga",
      funFact: "Yoga has been practiced for 5,000+ years.",
      stats: [
        { label: "Sessions Completed", value: 28, goal: 40 },
        { label: "Current Streak", value: 7, unit: "days" },
        { label: "Favorite Pose", value: "Pigeon" }
      ],
      badge: "Zen Master",
      tip: "Consistency creates progress—little and often is better than none.",
      tips: [
        "Don’t skip Savasana.",
        "Use props to safely deepen your stretch."
      ]
    }
  };
  