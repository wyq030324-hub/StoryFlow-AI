import {
  createContext,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { demoNovel } from "../data/demoNovel.js";

const StoryContext = createContext(null);

export const AGENT_KEYS = {
  originalAnalyzer: "originalAnalyzer",
  adaptationPlanner: "adaptationPlanner",
  screenplayWriter: "screenplayWriter",
  directorReviewer: "directorReviewer",
  yamlExporter: "yamlExporter",
};

export const AGENT_LABELS = {
  [AGENT_KEYS.originalAnalyzer]: "原著分析师",
  [AGENT_KEYS.adaptationPlanner]: "改编策划师",
  [AGENT_KEYS.screenplayWriter]: "剧本编剧",
  [AGENT_KEYS.directorReviewer]: "导演审查官",
  [AGENT_KEYS.yamlExporter]: "YAML导出官",
};

export const AGENT_FLOW = [
  AGENT_KEYS.originalAnalyzer,
  AGENT_KEYS.adaptationPlanner,
  AGENT_KEYS.screenplayWriter,
  AGENT_KEYS.directorReviewer,
  AGENT_KEYS.yamlExporter,
];

export const SCRIPT_ONLY_FLOW = [
  AGENT_KEYS.screenplayWriter,
];

export const OPTIONAL_ANALYSIS_FLOW = [
  AGENT_KEYS.originalAnalyzer,
  AGENT_KEYS.adaptationPlanner,
  AGENT_KEYS.directorReviewer,
  AGENT_KEYS.yamlExporter,
];

export const storyActionTypes = {
  SET_NOVEL_INPUT: "SET_NOVEL_INPUT",
  LOAD_DEMO: "LOAD_DEMO",
  START_WORKFLOW: "START_WORKFLOW",
  SET_AGENT_RUNNING: "SET_AGENT_RUNNING",
  SET_AGENT_DONE: "SET_AGENT_DONE",
  SET_AGENT_ERROR: "SET_AGENT_ERROR",
  SET_ANALYSIS_RESULT: "SET_ANALYSIS_RESULT",
  SET_ADAPTATION_PLAN: "SET_ADAPTATION_PLAN",
  SET_SCREENPLAY_DRAFT: "SET_SCREENPLAY_DRAFT",
  SET_REVIEW_RESULT: "SET_REVIEW_RESULT",
  SET_CHARACTER_GRAPH: "SET_CHARACTER_GRAPH",
  SET_DIRECTOR_ROOM: "SET_DIRECTOR_ROOM",
  SET_REWRITE_SUGGESTIONS: "SET_REWRITE_SUGGESTIONS",
  SET_GENERATED_YAML: "SET_GENERATED_YAML",
  SET_ACTIVE_SCENE: "SET_ACTIVE_SCENE",
  RESET_WORKFLOW: "RESET_WORKFLOW",
};

function createAgentStatus(status = "waiting") {
  return AGENT_FLOW.reduce((result, agentKey) => {
    result[agentKey] = status;
    return result;
  }, {});
}

function countCharacters(text) {
  return text.replace(/\s/g, "").length;
}

function normalizeAgentPayload(payload) {
  if (typeof payload === "string") {
    return payload;
  }

  return payload?.agent;
}

function workflowBaseState() {
  return {
    agentStatus: createAgentStatus(),
    generatedYaml: "",
    reviewResult: null,
    characterGraph: null,
    directorRoom: null,
    rewriteSuggestions: null,
    activeSceneId: null,
    workflowStep: "novelInput",
    scenes: [],
    analysisResult: null,
    adaptationPlan: null,
    screenplayDraft: null,
    error: null,
  };
}

export const initialStoryState = {
  novelInput: {
    title: "",
    content: "",
    paragraphs: [],
    source: "manual",
    wordCount: 0,
    styleTags: [],
  },
  ...workflowBaseState(),
  isDemoMode: false,
  lastUpdatedAt: null,
};

function withTimestamp(state) {
  return {
    ...state,
    lastUpdatedAt: new Date().toISOString(),
  };
}

function storyReducer(state, action) {
  switch (action.type) {
    case storyActionTypes.SET_NOVEL_INPUT: {
      const payload = action.payload || {};
      const content = payload.content ?? state.novelInput.content;

      return withTimestamp({
        ...state,
        novelInput: {
          ...state.novelInput,
          ...payload,
          content,
          paragraphs:
            payload.paragraphs ??
            content
              .split(/\n+/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean),
          wordCount: payload.wordCount ?? countCharacters(content),
          source: payload.source ?? "manual",
        },
        isDemoMode: payload.source === "demo" ? true : false,
        error: null,
      });
    }
    case storyActionTypes.LOAD_DEMO:
      return withTimestamp({
        ...state,
        ...workflowBaseState(),
        novelInput: {
          title: demoNovel.title,
          content: demoNovel.content,
          paragraphs: demoNovel.paragraphs,
          source: "demo",
          wordCount: demoNovel.wordCount,
          styleTags: demoNovel.styleTags,
        },
        isDemoMode: true,
      });
    case storyActionTypes.START_WORKFLOW:
      return withTimestamp({
        ...state,
        ...workflowBaseState(),
        workflowStep: AGENT_KEYS.originalAnalyzer,
      });
    case storyActionTypes.SET_AGENT_RUNNING: {
      const agent = normalizeAgentPayload(action.payload);

      return withTimestamp({
        ...state,
        agentStatus: {
          ...state.agentStatus,
          [agent]: "running",
        },
        workflowStep: agent,
        error: null,
      });
    }
    case storyActionTypes.SET_AGENT_DONE: {
      const agent = normalizeAgentPayload(action.payload);

      return withTimestamp({
        ...state,
        agentStatus: {
          ...state.agentStatus,
          [agent]: "done",
        },
        workflowStep:
          agent === AGENT_KEYS.yamlExporter ? "completed" : state.workflowStep,
      });
    }
    case storyActionTypes.SET_AGENT_ERROR: {
      const agent = normalizeAgentPayload(action.payload);
      const message =
        typeof action.payload === "string"
          ? "智能体执行失败。"
          : action.payload?.error || "智能体执行失败。";

      return withTimestamp({
        ...state,
        agentStatus: {
          ...state.agentStatus,
          [agent]: "error",
        },
        workflowStep: "error",
        error: message,
      });
    }
    case storyActionTypes.SET_ANALYSIS_RESULT:
      return withTimestamp({
        ...state,
        analysisResult: action.payload,
      });
    case storyActionTypes.SET_ADAPTATION_PLAN:
      return withTimestamp({
        ...state,
        adaptationPlan: action.payload,
      });
    case storyActionTypes.SET_SCREENPLAY_DRAFT: {
      const scenes = action.payload?.scenes || [];

      return withTimestamp({
        ...state,
        screenplayDraft: action.payload,
        scenes,
        activeSceneId: scenes[0]?.id ?? null,
      });
    }
    case storyActionTypes.SET_REVIEW_RESULT:
      return withTimestamp({
        ...state,
        reviewResult: action.payload?.reviewResult || action.payload,
        characterGraph: action.payload?.characterGraph || state.characterGraph,
        directorRoom: action.payload?.directorRoom || state.directorRoom,
      });
    case storyActionTypes.SET_CHARACTER_GRAPH:
      return withTimestamp({
        ...state,
        characterGraph: action.payload,
      });
    case storyActionTypes.SET_DIRECTOR_ROOM:
      return withTimestamp({
        ...state,
        directorRoom: action.payload,
      });
    case storyActionTypes.SET_REWRITE_SUGGESTIONS:
      return withTimestamp({
        ...state,
        rewriteSuggestions: action.payload,
      });
    case storyActionTypes.SET_GENERATED_YAML:
      return withTimestamp({
        ...state,
        generatedYaml: action.payload,
      });
    case storyActionTypes.SET_ACTIVE_SCENE:
      return withTimestamp({
        ...state,
        activeSceneId: action.payload,
      });
    case storyActionTypes.RESET_WORKFLOW:
      return withTimestamp({
        ...state,
        ...workflowBaseState(),
      });
    default:
      return state;
  }
}

export function StoryProvider({ children }) {
  const [state, dispatch] = useReducer(storyReducer, initialStoryState);

  const value = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state],
  );

  return (
    <StoryContext.Provider value={value}>{children}</StoryContext.Provider>
  );
}

export function useStory() {
  const context = useContext(StoryContext);

  if (!context) {
    throw new Error("useStory must be used within a StoryProvider");
  }

  return context;
}
