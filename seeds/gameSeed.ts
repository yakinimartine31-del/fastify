export const tasks = [
  { type: 'daily', title: 'Daily Login', description: 'Login to the app today', reward_xp: 50, reward_coins: 10, difficulty: 'easy' },
  { type: 'daily', title: 'Like 5 Posts', description: 'Like 5 posts in the feed', reward_xp: 30, reward_coins: 5, difficulty: 'easy' },
  { type: 'daily', title: 'Send a Message', description: 'Send a message to a friend', reward_xp: 40, reward_coins: 8, difficulty: 'easy' },
  { type: 'weekly', title: 'Complete Profile', description: 'Fill in all profile fields', reward_xp: 200, reward_coins: 50, difficulty: 'medium' },
  { type: 'weekly', title: 'Get 10 Followers', description: 'Gain 10 new followers', reward_xp: 300, reward_coins: 100, difficulty: 'medium' },
  { type: 'weekly', title: 'Create 3 Posts', description: 'Create 3 posts in the feed', reward_xp: 150, reward_coins: 30, difficulty: 'medium' },
  { type: 'achievement', title: 'First Win', description: 'Win your first game', reward_xp: 500, reward_coins: 200, difficulty: 'hard' },
  { type: 'achievement', title: 'Social Butterfly', description: 'Have 50 followers', reward_xp: 1000, reward_coins: 500, difficulty: 'hard' }
]

export const games = [
  { name: 'Quiz Battle', type: 'quiz', description: 'Test your knowledge in this exciting quiz battle', min_players: 1, max_players: 5, reward_coins: 50, reward_xp: 100 },
  { name: 'Puzzle Challenge', type: 'puzzle', description: 'Solve puzzles against other players', min_players: 1, max_players: 2, reward_coins: 30, reward_xp: 60 },
  { name: 'Word Scramble', type: 'mini', description: 'Unscramble words as fast as you can', min_players: 1, max_players: 10, reward_coins: 20, reward_xp: 40 },
  { name: 'Trivia Showdown', type: 'quiz', description: 'Answer trivia questions faster than opponents', min_players: 2, max_players: 8, reward_coins: 80, reward_xp: 160 },
  { name: 'Memory Match', type: 'puzzle', description: 'Match pairs of cards to win', min_players: 1, max_players: 4, reward_coins: 40, reward_xp: 80 }
]
