import { ArrowRight, FileText, PenLine, Sparkles, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { demoNovel } from "../data/demoNovel.js";

const rewriteStyles = [
  { name: "恐怖惊悚", mark: "惊" },
  { name: "悬疑推理", mark: "谜" },
  { name: "心理惊悚", mark: "心" },
  { name: "黑色幽默", mark: "黑" },
  { name: "青春爱情", mark: "恋" },
  { name: "诗意抒情", mark: "诗" },
  { name: "克苏鲁风格", mark: "雾" },
  { name: "赛博朋克", mark: "械" },
  { name: "宫崎骏治愈系", mark: "风" },
  { name: "诺兰烧脑风", mark: "时" },
];

const rewriteMocks = {
  恐怖惊悚: {
    title: "潮汐归档人 - 恐怖惊悚版",
    positioning: "封闭空间中的记忆异变恐怖短剧。",
    conflict: "林照必须确认父亲留下的录音是否真实，同时判断档案馆本身是否正在模仿人类记忆。",
    sceneDescription: "档案馆灯光逐层熄灭，卷宗柜像潮水一样缓慢移动，照片中的父亲在每次回看时更靠近镜头。",
    firstAction: "林照听见柜门内侧传来自己的呼吸声。她停下，柜门却从里面被轻轻敲了三下。",
    secondAction: "录音机没有播放父亲的声音，而是播放出林照刚刚说过的话。",
    line: "不要回答它。",
  },
  悬疑推理: {
    title: "潮汐归档人 - 悬疑推理版",
    positioning: "以证据链为核心的城市旧案推理剧。",
    conflict: "林照需要把照片编号、月牙伤痕和沉船档案缺页连成一条可验证的线索链。",
    sceneDescription: "桌面摊开旧照片、登记簿和录音磁带，每一件物证都指向一个被擦掉的名字。",
    firstAction: "林照把照片背面的编号抄到纸上，翻开失踪登记簿，空白页边缘留下同样的压痕。",
    secondAction: "她将编号倒过来读，发现那不是档案号，而是一串船舱座位号。",
    line: "不是船失踪，是记录被人偷走了。",
  },
  心理惊悚: {
    title: "潮汐归档人 - 心理惊悚版",
    positioning: "关于记忆不可靠的心理惊悚剧。",
    conflict: "林照无法判断父亲是否真的留下线索，还是自己在长期夜班中制造了替代记忆。",
    sceneDescription: "同一段走廊反复出现，灯光、钟声和窗户倒影每一次都略有不同。",
    firstAction: "林照第三次走过同一扇窗。窗玻璃上映着她的背影，却比她慢半拍转身。",
    secondAction: "照片中的父亲抬起头，嘴型和林照此刻的呼吸完全同步。",
    line: "我刚才已经来过这里。",
  },
  黑色幽默: {
    title: "潮汐归档人 - 黑色幽默版",
    positioning: "冷峻官僚系统下的荒诞悬疑短剧。",
    conflict: "城市记忆被删除，却需要林照提交三份纸质申请才能证明删除发生过。",
    sceneDescription: "恐惧被行政术语遮蔽，越严肃越荒诞。",
    firstAction: "打印机自动吐出一张表格，标题是《本人不存在情况说明》。",
    secondAction: "林照签完字，系统广播立刻宣布她的父亲从未出生。",
    line: "如需找回亲属，请先确认亲属曾经存在。",
  },
  青春爱情: {
    title: "潮汐归档人 - 青春爱情版",
    positioning: "悬疑外壳下的双人追查与情感修复。",
    conflict: "林照与旧友周屿共同追查沉船案，却发现两人的家庭都被同一段城市记忆改写。",
    sceneDescription: "档案馆、雨夜街口和码头成为两人关系推进的节点。",
    firstAction: "周屿把伞偏向林照，自己半边肩膀被雨打湿。他递出一张同样泛黄的船票。",
    secondAction: "船票背面写着两位母亲的名字，时间正好是沉船当夜。",
    line: "我母亲，也在那天晚上消失了。",
  },
  诗意抒情: {
    title: "潮汐归档人 - 诗意抒情版",
    positioning: "以海雾、纸页和灯塔组织情绪的诗性悬疑。",
    conflict: "林照寻找的不是单一真相，而是一座城市拒绝遗忘的方式。",
    sceneDescription: "动作减少，画面与旁白承担更多情绪重量。",
    firstAction: "纸页在风里轻轻翻动，像一群还不肯离开的白鸟。",
    secondAction: "林照把照片按在胸口，听见远处灯塔转身。",
    line: "如果城市会做梦，它梦见的一定是海。",
  },
  克苏鲁风格: {
    title: "潮汐归档人 - 克苏鲁风格版",
    positioning: "城市记忆与不可名状海底存在相连的宇宙恐怖。",
    conflict: "沉船案不是失踪事故，而是城市试图抵抗某种海底意识的失败记录。",
    sceneDescription: "海图、录音噪声和档案编号逐渐组成无法直视的图案。",
    firstAction: "灯塔光束扫过海图，雾里浮现的不是船影，而是一只缓慢睁开的巨大眼睛。",
    secondAction: "卷宗里的字开始向纸页深处沉下去，像被海底什么东西吞咽。",
    line: "不要记住它的形状。",
  },
  赛博朋克: {
    title: "潮汐归档人 - 赛博朋克版",
    positioning: "纸质档案与城市数据污染并存的近未来悬疑。",
    conflict: "旧城档案馆是城市记忆备份节点，而沉船案被某个系统持续覆盖。",
    sceneDescription: "霉味纸页与低饱和金色界面叠加，旧档案在空气中投影出破损数据。",
    firstAction: "林照接入磁带接口，纸质卷宗上的字开始同步改写。",
    secondAction: "每个被删除的名字都短暂亮成金色，然后被系统黑块覆盖。",
    line: "用户林照，记忆权限不足。",
  },
  宫崎骏治愈系: {
    title: "潮汐归档人 - 治愈奇幻版",
    positioning: "温柔奇幻气质的城市记忆守护故事。",
    conflict: "林照需要帮助一座正在遗忘自己的城市找回名字。",
    sceneDescription: "卷宗夹层飞出金色纸鱼，灯塔像会呼吸的老朋友。",
    firstAction: "卷宗夹层飞出一尾小小的金色纸鱼，它绕着林照的手背游了一圈。",
    secondAction: "纸鱼停在月牙伤痕上，吐出一枚湿漉漉的旧船票。",
    line: "你也记得他，对吗？",
  },
  诺兰烧脑风: {
    title: "潮汐归档人 - 时间谜题版",
    positioning: "时间线错位与记忆回写机制驱动的高概念悬疑。",
    conflict: "林照每阅读一次档案，现实时间线就被改写一次，父亲可能来自下一轮循环。",
    sceneDescription: "同一事件从不同时间方向重复，照片细节随主角选择改变。",
    firstAction: "林照翻到下一页，上一分钟前才写下的备注已经变成父亲的笔迹。",
    secondAction: "钟表倒走三格，门外敲门声先于敲门动作出现。",
    line: "这不是旧档案，这是未来寄回来的证据。",
  },
};

function buildRewriteScript(styleName, result, directorPrompt) {
  return {
    title: result.title,
    note: directorPrompt || `选择“${styleName}”方向后，保留原作核心事件，并强化对应风格的戏剧表达。`,
    scenes: [
      {
        sceneNumber: 1,
        heading: "内景 / 临港旧城档案馆 / 午夜",
        sceneDescription: result.sceneDescription,
        characters: ["林照"],
        actionLines: [result.firstAction, result.secondAction],
        dialogues: [
          {
            character: "林照",
            line: result.line,
          },
        ],
        transition: "灯光压低，切至下一场。",
      },
      {
        sceneNumber: 2,
        heading: "内景 / 档案馆楼梯间 / 深夜",
        sceneDescription: result.positioning,
        characters: ["林照", "门外来客"],
        actionLines: [
          "林照把照片塞进口袋，第一次没有退后。",
          "门外来客的影子停在楼梯口，像在等待她主动走近。",
        ],
        dialogues: [
          {
            character: "门外来客",
            line: "现在回头，还能假装什么都没发生。",
          },
          {
            character: "林照",
            line: "那就从我不回头开始。",
          },
        ],
        transition: "林照走下楼梯，城市灯光逐盏熄灭。",
      },
    ],
  };
}

function ScriptWindow({ script }) {
  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-story-gold/40 bg-story-bg">
      <div className="border-b border-story-border bg-story-card/80 px-4 py-4">
        <h4 className="font-serif text-2xl font-semibold">《{script.title}》</h4>
        <p className="mt-2 text-sm leading-6 text-story-muted">
          创作提示：{script.note}
        </p>
      </div>
      <div className="space-y-5 p-4">
        {script.scenes.map((scene) => (
          <article
            key={scene.sceneNumber}
            className="rounded-lg border border-story-border bg-story-card/70 p-4 text-sm leading-7"
          >
            <h5 className="font-serif text-xl text-story-text">
              第{scene.sceneNumber}场
            </h5>
            <p className="mt-2 text-story-gold">{scene.heading}</p>
            <p className="mt-3 text-story-muted">{scene.sceneDescription}</p>
            <p className="mt-2 text-story-muted">
              人物：{scene.characters.join("、")}
            </p>
            <div className="mt-4 space-y-2 text-story-text">
              {scene.actionLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <div className="mt-4 space-y-4 text-story-text">
              {scene.dialogues.map((dialogue) => (
                <div key={`${dialogue.character}-${dialogue.line}`} className="pl-4">
                  <p className="font-serif text-lg text-story-gold">
                    {dialogue.character}
                  </p>
                  <p>{dialogue.line}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-md border border-story-border bg-story-bg/70 px-3 py-2 text-story-muted">
              {scene.transition}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function Rewrite() {
  const [sourceText, setSourceText] = useState(demoNovel.content);
  const [directorPrompt, setDirectorPrompt] = useState("");
  const [selectedStyles, setSelectedStyles] = useState(["悬疑推理"]);
  const [resultVersion, setResultVersion] = useState(0);
  const [message, setMessage] = useState("");

  const generatedResults = useMemo(
    () =>
      selectedStyles
        .map((styleName) => {
          const result = rewriteMocks[styleName];

          if (!result) {
            return null;
          }

          return {
            styleName,
            result,
            script: buildRewriteScript(styleName, result, directorPrompt),
          };
        })
        .filter(Boolean),
    [selectedStyles, directorPrompt, resultVersion],
  );
  const hasGenerated = resultVersion > 0;

  function toggleStyle(styleName) {
    setSelectedStyles((current) => {
      if (current.includes(styleName)) {
        setMessage("");
        return current.filter((item) => item !== styleName);
      }

      if (current.length >= 3) {
        setMessage("最多选择三种风格，请先取消一个。");
        return current;
      }

      setMessage("");
      return [...current, styleName];
    });
  }

  function generateRewrite() {
    if (!selectedStyles.length) {
      setMessage("请选择改编方向，并点击生成重构剧本。");
      return;
    }

    setMessage("");
    setResultVersion((version) => version + 1);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-story-border bg-story-card/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-story-border bg-story-bg px-3 py-1 text-xs text-story-muted">
              <Wand2 size={14} className="text-story-gold" aria-hidden="true" />
              Creative Rewrite Engine
            </div>
            <h1 className="mt-4 font-serif text-3xl font-semibold md:text-4xl">
              创意重构引擎
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-story-muted">
              选择不同风格，生成不同版本剧本。适合探索恐怖、悬疑、爱情、治愈等多种导演表达方向。
            </p>
          </div>
          <Link
            to="/workspace"
            className="inline-flex items-center gap-2 rounded-md border border-story-border bg-story-bg px-4 py-3 text-sm text-story-text transition hover:border-story-gold hover:text-story-gold"
          >
            回到工作台
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(280px,0.72fr)_minmax(0,1.12fr)]">
        <aside className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.24)]">
          <div className="flex items-center gap-3">
            <span className="rounded-md border border-story-gold/50 bg-story-bg p-2 text-story-gold">
              <FileText size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm text-story-muted">输入区</p>
              <h2 className="font-serif text-xl font-semibold">原文与导演提示词</h2>
            </div>
          </div>

          <label htmlFor="rewrite-source" className="mt-5 block text-sm text-story-text">
            原文输入
          </label>
          <textarea
            id="rewrite-source"
            value={sourceText}
            onChange={(event) => setSourceText(event.target.value)}
            rows={12}
            className="mt-2 w-full resize-y rounded-lg border border-story-border bg-story-bg px-3 py-3 text-sm leading-7 text-story-text outline-none transition placeholder:text-story-muted focus:border-story-gold"
          />

          <label htmlFor="director-prompt" className="mt-5 block text-sm text-story-text">
            导演提示词
          </label>
          <textarea
            id="director-prompt"
            value={directorPrompt}
            onChange={(event) => setDirectorPrompt(event.target.value)}
            rows={5}
            className="mt-2 w-full resize-y rounded-lg border border-story-border bg-story-bg px-3 py-3 text-sm leading-7 text-story-text outline-none transition placeholder:text-story-muted focus:border-story-gold"
            placeholder="例如：请将这段都市奇幻故事改成更恐怖、更压抑的心理惊悚风格。"
          />
        </aside>

        <section className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.24)]">
          <div className="flex items-center gap-3">
            <span className="rounded-md border border-story-gold/50 bg-story-bg p-2 text-story-gold">
              <Sparkles size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm text-story-muted">风格选择</p>
              <h2 className="font-serif text-xl font-semibold">最多选择三种风格</h2>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {rewriteStyles.map((style) => {
              const isSelected = selectedStyles.includes(style.name);

              return (
                <button
                  key={style.name}
                  type="button"
                  onClick={() => toggleStyle(style.name)}
                  aria-pressed={isSelected}
                  className={`rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-story-gold bg-story-gold/10 text-story-text shadow-[0_0_24px_rgba(201,169,110,0.24)]"
                      : "border-story-border bg-story-card text-story-muted hover:border-story-gold hover:text-story-text"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-story-border bg-story-bg font-serif text-story-gold">
                      {style.mark}
                    </span>
                    <span className="text-sm">{style.name}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs leading-5 text-story-muted">
            已选：{selectedStyles.length ? selectedStyles.join(" / ") : "未选择"}
          </p>
          {message ? (
            <p className="mt-3 rounded-md border border-story-gold/40 bg-story-gold/10 px-3 py-2 text-xs text-story-gold">
              {message}
            </p>
          ) : null}
        </section>

        <section className="rounded-xl border border-story-border bg-story-card/95 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.24)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm text-story-muted">生成结果</p>
              <h2 className="font-serif text-xl font-semibold">完整新剧本展示窗口</h2>
            </div>
            <button
              type="button"
              onClick={generateRewrite}
              disabled={!sourceText.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-story-gold px-4 py-2 text-sm font-semibold text-story-bg shadow-[0_0_28px_rgba(201,169,110,0.22)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PenLine size={15} aria-hidden="true" />
              生成重构剧本
            </button>
          </div>

          {!hasGenerated ? (
            <div className="mt-5 rounded-lg border border-story-border bg-story-bg/70 p-5 text-sm leading-7 text-story-muted">
              请选择改编方向，并点击生成重构剧本。
            </div>
          ) : (
            <div key={resultVersion} className="mt-5 space-y-5">
              {generatedResults.map(({ styleName, result, script }, index) => (
                <article
                  key={styleName}
                  className="animate-reveal-up rounded-xl border border-l-4 border-story-border border-l-story-gold bg-story-bg/80 p-4"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <p className="text-sm text-story-gold">
                    方案 {index + 1} · {styleName}
                  </p>
                  <dl className="mt-4 grid gap-3 text-sm leading-7 md:grid-cols-2">
                    <div>
                      <dt className="text-story-muted">新风格定位</dt>
                      <dd className="text-story-text">{result.positioning}</dd>
                    </div>
                    <div>
                      <dt className="text-story-muted">新核心冲突</dt>
                      <dd className="text-story-text">{result.conflict}</dd>
                    </div>
                  </dl>
                  <ScriptWindow script={script} />
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

export default Rewrite;
