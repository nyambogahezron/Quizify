export type slidesProps = {
  id: number;
  title: string;
  description: string;
  icon: string;
  key: string;
};

export type RootStackParamList = {
  MainTabs: undefined;
  Quiz: { category: string };
  Result: { score: number; totalQuestions: number; coins: number };
  Profile: undefined;
  Bookmark: undefined;
  Settings: undefined;
  Leaderboard: undefined;
  CreateAccount: undefined;
  WordGame: undefined;
  OnBoard: undefined;
};
