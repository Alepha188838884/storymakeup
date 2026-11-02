import { useState, useMemo, useEffect } from 'react'
import './App.css'
import { getStoriesByDifficulty } from './stories'

// 词语与图片（表情）映射
const WORD_EMOJIS = {
  '小兔子': '🐰',
  '胡萝卜': '🥕',
  '小鸟': '🐦',
  '唱歌': '🎵',
  '歌声': '🎶',
  '大家': '👥',
  '喜欢': '❤️',
  '小狗': '🐕',
  '玩球': '⚽',
  '球': '⚽',
  '滚': '🔄',
  '追': '🏃',
  '小猫': '🐱',
  '睡觉': '😴',
  '太阳': '☀️',
  '小鸭子': '🦆',
  '游泳': '🏊',
  '水': '💧',
  '开心': '😊',
  '画画': '🎨',
  '画': '🖼️',
  '妈妈': '👩‍👦',
  '小树': '🌱',
  '叶子': '🍃',
  '树上': '🌿',
  '小汽车': '🚗',
  '跑': '💨',
  '轮子': '⚙️',
  '小朋友': '👶',
  '车里': '🚙',
  '小花朵': '🌸',
  '开放': '🌺',
  '花瓣': '🌷',
  '美丽': '🌷',
  '蝴蝶': '🦋',
  '小星星': '⭐',
  '闪烁': '✨',
  '天空': '🌙',
  '看': '👀',
  '小蚂蚁': '🐜',
  '搬东西': '📦',
  '勤劳': '💪',
  '一起': '🤝',
  '小蜜蜂': '🐝',
  '采蜜': '🍯',
  '花朵': '🌼',
  '蜂蜜': '🍯',
  '读书': '📚',
  '书': '📖',
  '知识': '🧠',
  '小火车': '🚂',
  '开动': '💨',
  '轨道': '🛤️',
  '乘客': '👥',
  '小雪花': '❄️',
  '飘落': '💨',
  '地面': '🏔️',
  '雪人': '⛄',
}

const createEmptyRound = () => ({
  id: `${Date.now()}-${Math.random()}`,
  wordsInput: '',
  emoji: '',
})

const pickStoryByDiff = (difficulty, excludeIds = [], category = '系统类', categoryMap = {}) => {
  const pool = category === '系统类'
    ? getStoriesByDifficulty(difficulty)
    : (categoryMap[category] || []).filter(story => story.difficulty === difficulty)
  const available = pool.filter(story => !excludeIds.includes(story.id))
  if (available.length === 0) return null
  return available[Math.floor(Math.random() * available.length)]
}

// 洗牌算法
function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function App() {
  const [customCategories, setCustomCategories] = useState(() => {
    if (typeof window === 'undefined') return {}
    try {
      const saved = window.localStorage.getItem('customCategories')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [category, setCategory] = useState('系统类')
  const [difficulty, setDifficulty] = useState('简单')
  const [score, setScore] = useState(0)
  const [showWin, setShowWin] = useState(false)
  const [hardCount, setHardCount] = useState(0)
  const [easyCount, setEasyCount] = useState(0)
  const [usedStoryIds, setUsedStoryIds] = useState([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [storyForm, setStoryForm] = useState({
    title: '',
    difficulty: '简单',
    rounds: [createEmptyRound()],
  })
  const [managementNote, setManagementNote] = useState('')
  const [showManager, setShowManager] = useState(false)
  const [story, setStory] = useState(() => pickStoryByDiff(difficulty, [], category, customCategories))
  const [step, setStep] = useState(0)
  const [selectedWords, setSelectedWords] = useState([])
  const [showReward, setShowReward] = useState(false)

  const isCustomCategory = category !== '系统类'
  const managedStories = isCustomCategory ? customCategories[category] || [] : []

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('customCategories', JSON.stringify(customCategories))
    }
  }, [customCategories])

  const refreshStory = (nextStory) => {
    setStory(nextStory)
    setStep(0)
    setSelectedWords([])
    setShowReward(false)
  }

  // 难度切换时，重置故事和计数和已用故事
  const handleDifficultyChange = (e) => {
    const diff = e.target.value
    setDifficulty(diff)
    setUsedStoryIds([])
    refreshStory(pickStoryByDiff(diff, [], category, customCategories))
    if (diff === '困难') setHardCount(0)
    if (diff === '简单') setEasyCount(0)
  }

  const handleCategoryChange = (e) => {
    const nextCategory = e.target.value
    setCategory(nextCategory)
    setUsedStoryIds([])
    setHardCount(0)
    setEasyCount(0)
    setManagementNote('')
    refreshStory(pickStoryByDiff(difficulty, [], nextCategory, customCategories))
  }

  const handleOpenManager = () => {
    setManagementNote('')
    setShowManager(true)
  }

  const handleCloseManager = () => {
    setShowManager(false)
    setManagementNote('')
  }

  const handleAddCategory = () => {
    const name = newCategoryName.trim()
    if (!name) {
      setManagementNote('请输入类别名称')
      return
    }
    if (name === '系统类') {
      setManagementNote('“系统类”是保留类别，不能重复创建')
      return
    }
    if (customCategories[name]) {
      setManagementNote(`类别 [${name}] 已存在`)
      return
    }
    const updated = { ...customCategories, [name]: [] }
    setCustomCategories(updated)
    setCategory(name)
    setNewCategoryName('')
    setUsedStoryIds([])
    setHardCount(0)
    setEasyCount(0)
    refreshStory(null)
    setManagementNote(`已创建类别 [${name}]，请在下方添加故事`)
  }

  const handleDeleteCategory = () => {
    if (!isCustomCategory) return
    const removedName = category
    const updated = { ...customCategories }
    delete updated[removedName]
    setCustomCategories(updated)
    setCategory('系统类')
    setUsedStoryIds([])
    setHardCount(0)
    setEasyCount(0)
    refreshStory(pickStoryByDiff(difficulty, [], '系统类', updated))
    setManagementNote(`已删除类别 [${removedName}]`)
  }

  const handleRoundChange = (roundId, field, value) => {
    setStoryForm(prev => ({
      ...prev,
      rounds: prev.rounds.map(round =>
        round.id === roundId ? { ...round, [field]: value } : round
      ),
    }))
  }

  const handleAddRound = () => {
    setStoryForm(prev => ({
      ...prev,
      rounds: [...prev.rounds, createEmptyRound()],
    }))
  }

  const handleRemoveRound = (roundId) => {
    setStoryForm(prev => {
      if (prev.rounds.length === 1) return prev
      return {
        ...prev,
        rounds: prev.rounds.filter(round => round.id !== roundId),
      }
    })
  }

  const handleAddCustomStory = () => {
    if (!isCustomCategory) {
      setManagementNote('请先选择或创建一个自定义类别')
      return
    }
    const title = storyForm.title.trim()
    if (!title) {
      setManagementNote('请输入故事标题')
      return
    }
    const formattedRounds = storyForm.rounds
      .map(round => {
        const words = round.wordsInput.split(/\s+/).map(w => w.trim()).filter(Boolean)
        if (words.length === 0) return null
        return {
          words,
          correctSentence: words.join(''),
          emoji: round.emoji || '',
        }
      })
      .filter(Boolean)
    if (formattedRounds.length === 0) {
      setManagementNote('至少需要一句有效的词语序列')
      return
    }
    const newStory = {
      id: Date.now() + Math.random(),
      title,
      theme: category,
      difficulty: storyForm.difficulty,
      rounds: formattedRounds,
      fullStory: formattedRounds.map(r => r.correctSentence).join(''),
    }
    const updatedCategoryStories = [...managedStories, newStory]
    const updatedCategories = { ...customCategories, [category]: updatedCategoryStories }
    setCustomCategories(updatedCategories)
    setStoryForm({
      title: '',
      difficulty,
      rounds: [createEmptyRound()],
    })
    setManagementNote(`故事 [${title}] 已添加到 ${category}`)
    if (!story && storyForm.difficulty === difficulty) {
      refreshStory(newStory)
    }
  }

  const handleDeleteCustomStory = (storyId) => {
    if (!isCustomCategory) return
    const updatedList = (customCategories[category] || []).filter(item => item.id !== storyId)
    const updatedCategories = { ...customCategories, [category]: updatedList }
    setCustomCategories(updatedCategories)
    setUsedStoryIds(prev => prev.filter(id => id !== storyId))
    setManagementNote('故事已删除')
    if (story && story.id === storyId) {
      refreshStory(pickStoryByDiff(difficulty, [], category, updatedCategories))
    }
  }

  // 每一轮词语顺序都打乱，且每次step变化都重新洗牌
  const current = story?.rounds?.[step] || null
  const shuffledWords = useMemo(() => (current ? shuffle(current.words) : []), [story, step])
  const availableWords = current ? shuffledWords.filter(word => !selectedWords.includes(word)) : []

  // 点击词语卡片
  const handleWordClick = (word) => {
    setSelectedWords([...selectedWords, word])
  }

  // 新增：点击已选词语撤销
  const handleRemoveSelectedWord = (idx) => {
    setSelectedWords(selectedWords.filter((_, i) => i !== idx))
  }

  // 朗读句子
  const handleSpeak = () => {
    if (selectedWords.length === 0) return
    const utter = new window.SpeechSynthesisUtterance(selectedWords.join(''))
    utter.lang = 'zh-CN'
    window.speechSynthesis.speak(utter)
  }

  // 重置本轮
  const handleReset = () => {
    setSelectedWords([])
  }

  // 撤回上一个选择
  const handleUndo = () => {
    setSelectedWords(prev => prev.slice(0, -1))
  }

  // 换一个随机故事（不重复）
  const handleChangeStory = () => {
    if (!story) return
    const newStory = pickStoryByDiff(difficulty, [...usedStoryIds, story.id], category, customCategories)
    if (!newStory) {
      setUsedStoryIds([])
      refreshStory(pickStoryByDiff(difficulty, [], category, customCategories))
      return
    }
    refreshStory(newStory)
    setUsedStoryIds(prev => [...prev, story.id])
  }

  // 新增：奖励区“下一个故事”按钮（不重复）
  const handleNextStory = () => {
    if (!story) return
    const newStory = pickStoryByDiff(difficulty, [...usedStoryIds, story.id], category, customCategories)
    if (!newStory) {
      setUsedStoryIds([])
      refreshStory(pickStoryByDiff(difficulty, [], category, customCategories))
      return
    }
    refreshStory(newStory)
    setUsedStoryIds(prev => [...prev, story.id])
  }

  // 完成本轮
  const handleNext = () => {
    if (!story || !current) return
    // 句子完成加1分
    setScore(prev => prev + 1)
    const roundsLength = story?.rounds?.length || 0
    if (step < roundsLength - 1) {
      setStep(step + 1)
      setSelectedWords([])
    } else {
      setShowReward(true)
      // 故事完成时处理难度升级/降级和额外加分
      setTimeout(() => {
        let extra = 0
        if (difficulty === '困难') extra = 5
        // 结算本故事总分
        setScore(prev => {
          const total = prev + extra
          if (total >= 30) {
            setShowWin(true)
            setTimeout(() => {
              setShowWin(false)
              setScore(0)
              setUsedStoryIds([])
              refreshStory(pickStoryByDiff(difficulty, [], category, customCategories))
            }, 2500)
            return 0
          }
          return total
        })
        // 其它难度升级/降级逻辑保持
        if (difficulty === '困难') {
          setHardCount(hardCount + 1)
          if (hardCount + 1 >= 3) {
            setDifficulty('中等')
            setUsedStoryIds([])
            refreshStory(pickStoryByDiff('中等', [], category, customCategories))
            setHardCount(0)
            return
          }
        }
        if (difficulty === '简单') {
          setEasyCount(easyCount + 1)
          if (easyCount + 1 >= 10) {
            setDifficulty('中等')
            setUsedStoryIds([])
            refreshStory(pickStoryByDiff('中等', [], category, customCategories))
            setEasyCount(0)
            return
          }
        }
        if (story) {
          setUsedStoryIds(prev => [...prev, story.id])
        }
      }, 500)
    }
  }

  // 重新开始当前故事（不影响已用列表）
  const handleRestart = () => {
    if (!story) return
    setStep(0)
    setSelectedWords([])
    setShowReward(false)
  }

  // 判断本轮是否完成
  const isCurrentDone = current ? selectedWords.length === current.words.length : false
  // 判断顺序是否正确
  const isOrderCorrect = isCurrentDone && current && selectedWords.join('') === current.correctSentence
  const noStoryMessage = !story && isCustomCategory
    ? (managedStories.length === 0
      ? '该类别还没有任何故事，请点击“修改类别/故事”添加后再开始游戏。'
      : `该类别在「${difficulty}」难度下暂无故事，请切换难度或点击“修改类别/故事”新增故事。`)
    : null

  return (
    <div className="container">
      <h1>造句大挑战</h1>
      <div style={{textAlign: 'center', marginBottom: 8, fontWeight: 'bold', color: '#e65100'}}>分数：{score}</div>
      <div className="category-row">
        <label style={{fontWeight: 'bold'}}>故事类别：</label>
        <select value={category} onChange={handleCategoryChange}>
          <option value="系统类">系统类</option>
          {Object.keys(customCategories).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <button className="simple-button primary" onClick={handleOpenManager}>修改类别/故事</button>
      </div>
      <div style={{marginBottom: 12, textAlign: 'center'}}>
        <label style={{marginRight: 8}}>难度：</label>
        <select value={difficulty} onChange={handleDifficultyChange} style={{fontSize: '1rem', marginRight: 16}}>
          <option value="简单">简单</option>
          <option value="中等">中等</option>
          <option value="困难">困难</option>
        </select>
        <span style={{fontWeight: 'bold', color: '#1976d2'}}>{story ? story.title : '暂无故事'}</span>
        <button onClick={handleChangeStory} style={{marginLeft: 16, fontSize: '1rem'}} disabled={!story}>换一个故事</button>
      </div>
      {noStoryMessage && <div className="note warning">{noStoryMessage}</div>}
      {/* 新增：胜利提示框 */}
      {showWin && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.4)',zIndex:99,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',padding:32,borderRadius:16,boxShadow:'0 4px 24px #0002',fontSize:'2rem',color:'#388e3c',textAlign:'center'}}>
            🎉 恭喜你获得胜利！
          </div>
        </div>
      )}
      {!story ? (
        <div className="empty-state">请选择系统故事或点击“修改类别/故事”创建自定义故事。</div>
      ) : showReward ? (
        <div>
          <h2 className="reward-animate">🎉 恭喜你完成了小故事！</h2>
          <div style={{fontSize: '2.5rem', margin: '16px 0'}}>
            {story.rounds.map((s, idx) => (
              <div key={idx} style={{marginBottom: 8}}>
                <span className="reward-animate">{s.emoji}</span> <span style={{marginLeft: 8, color:'#00796b'}}>{s.correctSentence}</span>
              </div>
            ))}
          </div>
          <button onClick={handleRestart}>再玩一次</button>
          <button onClick={handleNextStory} style={{marginLeft: 12}}>下一个故事</button>
        </div>
      ) : (
        <>
          <div style={{fontSize: '2.5rem', margin: '12px 0'}} className={isOrderCorrect ? 'reward-animate' : ''}>{current?.emoji || ''}</div>
          <div className="word-list">
            {availableWords.map(word => (
              <div
                key={word}
                className="word-card"
                onClick={() => handleWordClick(word)}
              >
                {/* 始终渲染一个高度为2rem的占位div，保证文字对齐 */}
                <div style={{fontSize: '2rem', marginBottom: 4, height: '2rem', lineHeight: '2rem'}}>
                  {WORD_EMOJIS[word] ? WORD_EMOJIS[word] : ''}
                </div>
                {word}
              </div>
            ))}
          </div>
          <div className={"sentence-bar" + (isOrderCorrect ? ' reward-animate' : '')}>
            {selectedWords.map((word, idx) => (
              <span className="sentence-word" key={idx} onClick={() => handleRemoveSelectedWord(idx)} style={{cursor:'pointer'}}>{word}</span>
            ))}
          </div>
          <div className="actions">
            <button onClick={handleSpeak} disabled={selectedWords.length === 0}>朗读句子</button>
            <button onClick={handleReset} style={{marginLeft: 8}}>重置</button>
            <button onClick={handleUndo} style={{marginLeft: 8}} disabled={selectedWords.length === 0}>撤回</button>
            <button
              onClick={handleNext}
              style={{marginLeft: 8, background: isOrderCorrect ? '#b6e388' : '#eee', color: isOrderCorrect ? '#2e7d32' : '#aaa'}}
              disabled={!isOrderCorrect}
            >
              {step < (story.rounds.length - 1) ? '下一句' : '完成故事'}
            </button>
          </div>
          <div style={{marginTop: 12, color: isCurrentDone ? (isOrderCorrect ? '#2e7d32' : 'crimson') : '#888'}}>
            {isCurrentDone ? (isOrderCorrect ? '✅ 顺序正确！' : '❌ 顺序不对，请重试') : '请点击词语组成句子'}
          </div>
        </>
      )}

      {showManager && (
        <div className="manager-modal">
          <div className="manager-content">
            <div className="manager-header">
              <h3>类别与故事管理</h3>
              <button className="simple-button" onClick={handleCloseManager}>关闭</button>
            </div>
            <div className="manager-section">
              <label className="manager-label">当前类别</label>
              <div className="manager-row">
                <select value={category} onChange={handleCategoryChange} className="custom-select">
                  <option value="系统类">系统类</option>
                  {Object.keys(customCategories).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="manager-row">
                <input
                  className="custom-text-input"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  placeholder="新类别名称"
                />
                <button className="simple-button primary" onClick={handleAddCategory}>新增类别</button>
                <button className="simple-button danger" onClick={handleDeleteCategory} disabled={!isCustomCategory}>删除当前类别</button>
              </div>
              <p className="helper-text">“系统类”为内置故事，仅供选择游玩；若需自定义内容，可先创建新类别再添加故事。</p>
              {managementNote && <div className="note">{managementNote}</div>}
            </div>
            {isCustomCategory ? (
              <>
                <div className="manager-section">
                  <h4>添加新故事</h4>
                  <p className="helper-text">词语请用空格分开，例如：<code>小狗 在 公园 玩球 。</code></p>
                  <div className="custom-form-row">
                    <label>故事标题</label>
                    <input
                      className="custom-text-input"
                      value={storyForm.title}
                      onChange={e => setStoryForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="请输入故事标题"
                    />
                  </div>
                  <div className="custom-form-row">
                    <label>故事难度</label>
                    <select
                      className="custom-select"
                      value={storyForm.difficulty}
                      onChange={e => setStoryForm(prev => ({ ...prev, difficulty: e.target.value }))}
                    >
                      <option value="简单">简单</option>
                      <option value="中等">中等</option>
                      <option value="困难">困难</option>
                    </select>
                  </div>
                  <div className="custom-form-row">
                    <label>句子列表（每行一个句子，词语以空格分隔）</label>
                    <div className="custom-rounds">
                      {storyForm.rounds.map(round => (
                        <div className="custom-round-row" key={round.id}>
                          <input
                            className="custom-text-input"
                            value={round.wordsInput}
                            onChange={e => handleRoundChange(round.id, 'wordsInput', e.target.value)}
                            placeholder="例如：小狗 在 公园 玩球 。"
                          />
                          <input
                            className="custom-text-input"
                            value={round.emoji}
                            onChange={e => handleRoundChange(round.id, 'emoji', e.target.value)}
                            placeholder="表情/插画（可选）"
                          />
                          {storyForm.rounds.length > 1 && (
                            <button type="button" className="simple-button danger" onClick={() => handleRemoveRound(round.id)}>删除</button>
                          )}
                        </div>
                      ))}
                      <button type="button" className="simple-button" onClick={handleAddRound}>添加一句</button>
                    </div>
                  </div>
                  <button type="button" className="simple-button primary" onClick={handleAddCustomStory}>保存故事到 {category}</button>
                </div>
                <div className="manager-section">
                  <h4>{category} 已有故事</h4>
                  {managedStories.length === 0 ? (
                    <p className="helper-text">暂未添加故事，添加后可在主页面开始挑战。</p>
                  ) : (
                    managedStories.map(item => (
                      <div className="custom-story-item" key={item.id}>
                        <div>
                          <div><strong>{item.title}</strong>（{item.difficulty}）</div>
                          <div className="custom-story-sentences">
                            {item.rounds.map((round, idx) => (
                              <span key={idx}>{round.correctSentence}{idx < item.rounds.length - 1 ? ' / ' : ''}</span>
                            ))}
                          </div>
                        </div>
                        <button className="simple-button danger" onClick={() => handleDeleteCustomStory(item.id)}>删除</button>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="note warning">系统类故事由平台提供，可以直接游玩；如需自定义内容，请切换到其它类别进行管理。</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
