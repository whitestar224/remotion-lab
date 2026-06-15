# Remotion Lab Components

一套可复制进 Remotion 项目的视频动效组件库，当前包含 222 个 `.tsx` 组件。组件风格参考了 [Remotion Lab showcase](https://remotionlab.com/showcase) 的展示方式，重点覆盖数据可视化、社交媒体卡片、Logo reveal、标题字效、转场、倒计时、字幕、音频视觉化和完整场景模板。

这个仓库是源码型组件库，不强制绑定某个 Remotion app 结构。推荐按需复制单个文件，或把整个目录放到你的 Remotion 项目的 `src/remotion-lab/` 下使用。

## 快速使用

在 Remotion 项目中引入任意组件：

```tsx
import { Composition } from "remotion";
import { BlurFocusTitle } from "./remotion-lab/BlurFocusTitle";

export const RemotionRoot = () => {
  return (
    <Composition
      id="BlurFocusTitle"
      component={BlurFocusTitle}
      durationInFrames={120}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
```

大多数组件默认按 `1920x1080` 设计，并通过 `useCurrentFrame()`、`useVideoConfig()`、`interpolate()` 和 `spring()` 驱动时间线。如果你要改成竖屏或方屏，优先调整组件里的定位常量、画布尺寸和字体尺度。

## 动效分类

| 分类 | 代表组件 | 适用场景 |
| --- | --- | --- |
| 数据图表 | `AreaChart`, `BarChart`, `CandlestickChart`, `Heatmap`, `SankeyDiagram`, `WaterfallChart` | 财经、复盘、产品指标、增长报告 |
| 社交媒体卡片 | `YoutubeFeed`, `YtVideoCard`, `TwitterQuote`, `RedditPost`, `TiktokCard`, `ProductHuntCard` | 视频包装、社媒战报、内容展示 |
| Logo Reveal | `LogoMorphIntro`, `LogoGlowPulse`, `LogoHologram`, `LogoStampReveal`, `LogoTriangleForm` | 片头、品牌露出、频道开场 |
| 标题字效 | `BlurFocusTitle`, `GlitchTextTitle`, `HandwritingTitle`, `ScrambleTitle`, `WaveTextTitle` | 章节标题、冲击标题、短视频钩子 |
| 卡片和下三分之一 | `CardElastic`, `CardGlass`, `CardStagger`, `LowerThirdBoxPop`, `LowerThirdSocial` | 人物介绍、播客字幕条、信息卡 |
| 转场 | `FadeCrossTransition`, `FilmBurnTransition`, `PageFlipTransition`, `SplitDoorsTransition`, `ZoomThroughTransition` | 场景切换、章节切换、短视频节奏点 |
| 音频视觉化 | `AudioBarSpectrum`, `AudioCircleViz`, `AudioPulseRing`, `AudioVinylRecord` | 音乐、播客、声音可视化 |
| 倒计时和字幕 | `CountdownBlast`, `CountdownCircle`, `SubtitleDualLang`, `SubtitleKaraoke`, `SubtitleSlide` | 直播倒计时、口播字幕、双语字幕 |
| 完整场景模板 | `CodeControlsScene`, `DevFlowStepsScene`, `Scene130SkillShowcase`, `Scene211DeployCloudflare` | 教程视频、产品叙事、AI 工具演示 |

## 设计和时间线约定

- 组件大多是单文件、无外部状态的 React 函数组件，适合直接复制和改文案。
- 入场动效通常使用 `spring()`，图形绘制、透明度、位移和数字增长通常使用 `interpolate()`。
- 复杂场景按 frame 拆成多个 phase，例如标题入场、主体出现、强调脉冲、收尾淡出。
- 图表类组件多使用 SVG 或绝对定位 div 绘制，适合改数据数组和颜色常量。
- `_transparent` 文件是透明背景版本，适合叠加到其他视频或背景上。
- 部分场景调用了 `staticFile("audio/connection/...")`，使用前请在 Remotion 项目的 `public/audio/connection/` 下补齐音效，或移除对应的 `<Audio />`。

## 推荐工作流

1. 从 README 的分类里选择接近目标的组件。
2. 复制该 `.tsx` 文件到 Remotion 项目的组件目录。
3. 修改组件顶部的数据、文案、颜色常量。
4. 在 `Root.tsx` 中注册 `Composition`，先用 `durationInFrames={120}` 到 `300` 预览。
5. 如果做透明叠加，优先选择文件名带 `_transparent` 的版本。

## 本仓库校验

仓库提供一个轻量语法检查脚本，会把所有 `.tsx` 文件作为 entry 扫描并使用 esbuild 解析：

```bash
npm install
npm run check:syntax
```

这个检查只验证 TSX/JSX 语法和模块解析，不等同于完整 Remotion 渲染测试。真正投产前，建议把选中的组件注册到你的 Remotion 项目里，用 Studio 预览关键帧。

## 说明

组件文件保留了原始文件名，包含一些带连字符的 scene 文件名，例如 `Scene03-Control.tsx`。文件名可以保留，组件导出名已经修正为合法 TypeScript 标识符，例如 `Scene03Control`。
