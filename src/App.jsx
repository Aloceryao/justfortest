import React, {
  useState,
  useEffect,
  useMemo,
  memo,
  useRef,
  useCallback,
} from 'react';
import {
  Beer,
  GlassWater,
  Calculator,
  Settings,
  Plus,
  Search,
  Edit3,
  Trash2,
  Save,
  History,
  AlertTriangle,
  Download,
  Upload,
  RefreshCcw,
  X,
  ChevronLeft,
  Wine,
  Camera,
  AlertCircle,
  Tag,
  Check,
  DollarSign,
  Filter,
  Layers,
  Quote,
  FilePlus,
  Globe,
  Star,
  FolderPlus,
  BookOpen,
  MoreHorizontal,
  LayoutGrid,
  ListPlus,
  ArrowLeft,
  Image as ImageIcon,
  Database,
  Info,
  Percent,
  FileSpreadsheet,
  Lock,
  Unlock,
  KeyRound,
  ShoppingCart,
  LayoutDashboard,
  Cloud,
  CloudOff,
  Wifi,
  WifiOff,
  Users,
  LogIn,
  UserCog,
  LogOut,
  Utensils,
  ChefHat,
  Coffee,
  QrCode,
  HelpCircle,
  Play,
} from 'lucide-react';

// ==========================================
// 0. Configuration & Cloud Core
// ==========================================

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBsBdSgpxObAHxGnlKwSSVIv5unvVdxVSU',
  authDomain: 'intoxbartest.firebaseapp.com',
  projectId: 'intoxbartest',
  storageBucket: 'intoxbartest.firebasestorage.app',
  messagingSenderId: '836067365212',
  appId: '1:836067365212:web:65cd66157b85d76afab199',
};

const loadFirebase = () => {
  return new Promise((resolve, reject) => {
    if (window.firebase && window.firebase.firestore)
      return resolve(window.firebase);
    const script = document.createElement('script');
    script.src =
      'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
    script.onload = () => {
      const script2 = document.createElement('script');
      script2.src =
        'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js';
      script2.onload = () => {
        try {
          if (!window.firebase.apps.length) {
            window.firebase.initializeApp(FIREBASE_CONFIG);
          }
          resolve(window.firebase);
        } catch (e) {
          reject(e);
        }
      };
      script2.onerror = reject;
      document.body.appendChild(script2);
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

const compressImage = (base64Str, maxWidth = 800, quality = 0.6) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(base64Str);
  });
};

const DB_NAME = 'BarManagerDB';
const STORE_NAME = 'images';

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

const ImageDB = {
  save: async (id, dataUrl) => {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(dataUrl, id);
        tx.oncomplete = () => resolve(id);
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
  get: async (id) => {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      return null;
    }
  },
  delete: async (id) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
      return new Promise((resolve) => {
        tx.oncomplete = () => resolve();
      });
    } catch (e) {
      console.error(e);
    }
  },
};

const useImageLoader = (imageId) => {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    if (!imageId) {
      setSrc(null);
      return;
    }
    if (imageId.startsWith('data:') || imageId.startsWith('http')) {
      setSrc(imageId);
      return;
    }
    let isMounted = true;
    ImageDB.get(imageId).then((data) => {
      if (isMounted && data) setSrc(data);
    });
    return () => {
      isMounted = false;
    };
  }, [imageId]);
  return src;
};

const AsyncImage = memo(({ imageId, alt, className, fallback }) => {
  const src = useImageLoader(imageId);
  if (!src)
    return (
      fallback || (
        <div
          className={`bg-slate-800 flex items-center justify-center text-slate-700 ${className}`}
        >
          <Wine size={32} opacity={0.3} />
        </div>
      )
    );
  return <img src={src} alt={alt} className={className} loading="lazy" />;
});

// --- Error Boundary ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App Crash:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center z-[80]">
          <div className="w-20 h-20 bg-rose-900/30 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle size={40} className="text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">應用程式發生錯誤</h1>
          <p className="text-slate-400 mb-8 text-sm max-w-xs">
            {this.state.error?.toString()}
          </p>
          <div className="space-y-3 w-full max-w-xs">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-white shadow-lg"
            >
              重新整理頁面
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full py-3 border border-rose-500 text-rose-500 rounded-xl font-bold hover:bg-rose-900/20"
            >
              重置所有資料 (救命按鈕)
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const DEFAULT_BASE_SPIRITS = [
  'Gin 琴酒',
  'Whisky 威士忌',
  'Rum 蘭姆酒',
  'Tequila 龍舌蘭',
  'Vodka 伏特加',
  'Brandy 白蘭地',
  'Liqueur 利口酒',
];

const ICON_TYPES = {
  whisky: {
    label: '威士忌杯',
    component: (props) => (
      <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 4h14v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4z" />
        <path d="M5 10h14" />
      </svg>
    ),
  },
  martini: {
    label: '馬丁尼杯',
    component: (props) => (
      <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 22h8" />
        <path d="M12 22v-11" />
        <path d="M2 3l10 10 10-10" />
      </svg>
    ),
  },
  highball: {
    label: '高球杯',
    component: (props) => (
      <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M7 3h10v18a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V3z" />
      </svg>
    ),
  },
  snifter: {
    label: '白蘭地杯',
    component: (props) => (
      <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M7 21h10" />
        <path d="M12 21v-3" />
        <path d="M6 10h12" />
        <path d="M19 10a7 7 0 0 0-14 0c0 4.5 3.5 8 7 8s7-3.5 7-8z" />
      </svg>
    ),
  },
  shot: {
    label: '一口杯',
    component: (props) => (
      <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 3l-2 18H8L6 3h12z" />
      </svg>
    ),
  },
  wine: {
    label: '酒杯',
    component: (props) => (
      <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 21h6" />
        <path d="M12 21v-6" />
        <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-1.5-4.5l-3.5 2-3.5-2C7.5 6 7 8 7 10a5 5 0 0 0 5 5z" />
      </svg>
    ),
  },
  shaker: {
    label: '雪克杯',
    component: (props) => (
      <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 9h12v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9z" />
        <path d="M6 5h12v4H6z" />
        <path d="M9 2h6v3H9z" />
      </svg>
    ),
  },
  soft: {
    label: '軟飲',
    component: (props) => (
      <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
};

const CategoryIcon = ({ iconType, className }) => {
  const IconComponent =
    ICON_TYPES[iconType]?.component || ICON_TYPES['shaker'].component;
  return <IconComponent className={className} />;
};

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2);
const safeString = (str) => (str || '').toString();
const safeNumber = (num) => {
  const n = parseFloat(num);
  return isNaN(n) ? 0 : n;
};

// 強化版計算邏輯
const calculateRecipeStats = (recipe, allIngredients) => {
  if (!recipe)
    return { cost: 0, costRate: 0, abv: 0, volume: 0, price: 0, finalAbv: 0 };

  if (recipe.type === 'food') {
    return {
      cost: 0,
      costRate: 0,
      abv: 0,
      volume: 0,
      price: safeNumber(recipe.price),
    };
  }

  if (recipe.type === 'single' || recipe.isIngredient) {
    const capacity =
      safeNumber(recipe.bottleCapacity) || safeNumber(recipe.volume) || 700;
    const cost = safeNumber(recipe.bottleCost) || safeNumber(recipe.price) || 0;
    const price =
      safeNumber(recipe.priceGlass) || safeNumber(recipe.priceShot) || 0;
    const costRate =
      price > 0 && capacity > 0 ? (((cost / capacity) * 50) / price) * 100 : 0;
    return {
      cost,
      costRate,
      finalAbv: safeNumber(recipe.abv) || 40,
      volume: capacity,
      price,
    };
  }

  let totalCost = 0,
    totalAlcoholVol = 0,
    totalVolume = 0;

  if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
    recipe.ingredients.forEach((item) => {
      const ing = (allIngredients || []).find((i) => i.id === item.id);
      const amount = safeNumber(item.amount);
      if (ing) {
        const vol = safeNumber(ing.volume);
        const pricePerMl = vol > 0 ? safeNumber(ing.price) / vol : 0;
        totalCost += pricePerMl * amount;
        totalAlcoholVol += amount * (safeNumber(ing.abv) / 100);
        totalVolume += amount;
      }
    });
  }
  if (recipe.garnish) totalCost += 5;

  const finalAbv = totalVolume > 0 ? (totalAlcoholVol / totalVolume) * 100 : 0;
  const price =
    recipe.price && recipe.price > 0
      ? recipe.price
      : Math.ceil(totalCost / 0.3 / 10) * 10;
  const costRate = price > 0 ? (totalCost / price) * 100 : 0;

  return {
    cost: Math.round(totalCost),
    costRate,
    finalAbv,
    volume: Math.round(totalVolume),
    price,
  };
};

// Help Modal Component (Main App) - 已改為萬用模板
const HelpModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('start');
  if (!isOpen) return null;

  // 1. 這裡設定分頁標題
  const tabs = [
    { id: 'start', label: '📖 使用說明書' }, 
    { id: 'cost', label: '💰 進階教學' },
    { id: 'faq', label: '❓ 常見問題' }, 
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* 標題列 */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <HelpCircle size={20} className="text-amber-500" /> 使用指南
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        {/* 分頁按鈕列 */}
        <div className="flex bg-slate-950 border-b border-slate-800 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 text-sm font-bold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-amber-500 border-b-2 border-amber-500 bg-slate-900'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 2. 內容區：請在這裡貼上您的詳細說明書 */}
        <div className="flex-1 overflow-y-auto p-6 text-slate-300 space-y-6 custom-scrollbar leading-relaxed">
          
          {/* 第 1 頁內容：使用說明書 */}
          {activeTab === 'start' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-bold text-lg mb-2">第一章：基礎概念</h4>
                <p>
                  這裡是您的詳細說明文字。
                  如果文字很長，系統會自動讓您可以往下滑動，不用擔心。
                </p>
              </div>

              <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                <h5 className="text-amber-500 font-bold mb-1">重點提示區塊</h5>
                <p className="text-sm">
                  如果您有特別想強調的文字，可以放在這個有背景色的框框裡。
                </p>
              </div>

              <div>
                <h4 className="text-white font-bold text-lg mb-2">第二章：建立步驟</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>第一步：點擊新增按鈕</li>
                  <li>第二步：輸入資料</li>
                  <li>第三步：按下儲存</li>
                </ul>
              </div>
            </div>
          )}

          {/* 第 2 頁內容：進階教學 */}
          {activeTab === 'cost' && (
            <div className="space-y-4">
               <h4 className="text-white font-bold text-lg">關於成本計算</h4>
               <p>
                 在這裡貼上您關於成本計算的詳細邏輯說明...
               </p>
            </div>
          )}

          {/* 第 3 頁內容：常見問題 */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              <div>
                <h5 className="text-white font-bold text-amber-500">Q: 這是問題一？</h5>
                <p>A: 這是回答一。</p>
              </div>
            </div>
          )}

        </div>
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <button onClick={onClose} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors">
            關閉說明
          </button>
        </div>
      </div>
    </div>
  );
};

// Login Help Modal Component (登入前說明 - 文字已優化)
const LoginHelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-scale-in">
        <h3 className="text-xl font-bold text-white mb-4 text-center">如何開始使用？</h3>
        <div className="space-y-4 text-sm text-slate-300">
          <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
            <strong className="text-amber-500 block mb-1">1. Shop ID 是什麼？</strong>
            <p>就像您的 IG 帳號。請自創一個代碼（例如：my_bar_01）。</p>
            <p className="mt-1 text-slate-400 text-xs">未來在別台手機輸入同一個 ID，就能看到一樣的資料。</p>
          </div>
          <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
            <strong className="text-amber-500 block mb-1">2. 需要註冊嗎？</strong>
            <p>不需要！直接輸入您想用的 Shop ID，並選擇「店長」身分，系統會自動為您建立新資料庫。</p>
          </div>
          <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
            <strong className="text-amber-500 block mb-1">3. 關於密碼</strong>
            <p>第一次登入時輸入的密碼，就會直接設定成未來的「管理員密碼」。請務必記住喔！</p>
          </div>
        </div>
        <button onClick={onClose} className="w-full mt-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-colors">
          我瞭解了，開始輸入
        </button>
      </div>
    </div>
  );
};

// 新增：頁面介紹彈窗 (Welcome/Intro Modal)
const PageIntroModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col">
        
        {/* 1. 圖片區域 */}
        <div className="h-40 bg-slate-800 relative">
          <div className="absolute inset-0 flex items-center justify-center text-slate-600">
             <ImageIcon size={48} className="opacity-50" />
             <span className="ml-2 text-sm font-bold">在此放入說明圖片</span>
          </div>
          {/* 漸層遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        </div>

        {/* 2. 文字說明區域 */}
        <div className="p-6 -mt-4 relative z-10">
          <h3 className="text-xl font-bold text-white mb-2 font-serif">
            歡迎使用 Bar Manager! 🍷
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            這是一個專為調酒師設計的雲端管理系統。
            <br/><br/>
            👉 <strong>建立酒譜</strong>：計算成本與利潤。
            <br/>
            👉 <strong>管理庫存</strong>：掌握每一滴酒的流向。
            <br/>
            👉 <strong>電子酒單</strong>：給客人掃碼點餐。
          </p>

          <button 
            onClick={onClose} 
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold shadow-lg shadow-amber-900/20 transition-all active:scale-95"
          >
            開始使用
          </button>
        </div>
      </div>
    </div>
  );
};

const PricingTable = ({ recipe }) => {
  if (recipe.type !== 'single' && !recipe.isIngredient) return null;
  const capacity =
    safeNumber(recipe.bottleCapacity) || safeNumber(recipe.volume) || 700;
  const cost = safeNumber(recipe.bottleCost) || safeNumber(recipe.price) || 0;
  const costPerMl = capacity > 0 ? cost / capacity : 0;
  const userTargetRate = safeNumber(recipe.targetCostRate) || 25;
  const targetCostRateDecimal = userTargetRate / 100;
  const formatCurrency = (val) => Math.round(val || 0).toLocaleString();
  const formatCost = (val) => (val || 0).toFixed(1);
  const getMarginColor = (price, itemCost) => {
    const numPrice = safeNumber(price);
    if (!numPrice || numPrice === 0) return 'text-slate-500';
    const margin = ((numPrice - itemCost) / numPrice) * 100;
    return margin < 70 ? 'text-rose-400' : 'text-emerald-400';
  };
  const rows = [
    {
      label: 'Shot (30ml)',
      cost: costPerMl * 30,
      suggest:
        targetCostRateDecimal > 0
          ? (costPerMl * 30) / targetCostRateDecimal
          : 0,
      price: recipe.priceShot,
      isMain: false,
    },
    {
      label: '單杯 (50ml)',
      cost: costPerMl * 50,
      suggest:
        targetCostRateDecimal > 0
          ? (costPerMl * 50) / targetCostRateDecimal
          : 0,
      price: recipe.priceGlass,
      isMain: true,
    },
    {
      label: '整瓶',
      cost: cost,
      suggest: targetCostRateDecimal > 0 ? cost / targetCostRateDecimal : 0,
      price: recipe.priceBottle,
      isMain: false,
    },
  ];
  return (
    <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50 mb-6 mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-amber-500 font-semibold text-xs uppercase tracking-wider">
          <DollarSign size={14} />
          <span>成本與售價</span>
        </div>
        <div className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
          Target: {userTargetRate}%
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 text-sm">
        <div className="grid grid-cols-5 gap-2 text-[10px] text-slate-500 border-b border-slate-800 pb-2 mb-1 text-center font-bold uppercase">
          <div className="text-left pl-2">規格</div>
          <div>成本</div>
          <div>建議</div>
          <div className="text-amber-500">自訂</div>
          <div>毛利</div>
        </div>
        {rows.map((row, idx) => (
          <div
            key={idx}
            className={`grid grid-cols-5 gap-2 items-center text-center py-2 rounded-lg ${
              row.isMain ? 'bg-slate-800/50 border border-slate-700/30' : ''
            }`}
          >
            <div className="text-left font-medium text-slate-200 pl-2 text-xs">
              {row.label}
            </div>
            <div className="text-slate-400 text-xs">
              ${formatCost(row.cost)}
            </div>
            <div className="text-slate-500 text-xs">
              ${formatCurrency(row.suggest)}
            </div>
            <div
              className={`font-bold font-mono text-sm ${
                safeNumber(row.price) > 0 ? 'text-amber-400' : 'text-slate-700'
              }`}
            >
              {safeNumber(row.price) > 0
                ? `$${formatCurrency(row.price)}`
                : '-'}
            </div>
            <div
              className={`text-xs font-bold ${getMarginColor(
                row.price,
                row.cost
              )}`}
            >
              {Math.round(
                ((safeNumber(row.price) - row.cost) / safeNumber(row.price)) *
                  100
              ) || '-'}
              %
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
const IngredientRow = memo(({ ing, onClick, onDelete, readOnly }) => (
  <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-800 hover:border-slate-600 transition-colors group w-full">
    <div
      className="flex items-center gap-3 flex-1 cursor-pointer overflow-hidden"
      onClick={() => !readOnly && onClick(ing)}
    >
      <div
        className={`w-2 h-10 rounded-full shrink-0 ${
          ['alcohol'].includes(ing.type)
            ? 'bg-purple-500/50'
            : ['soft'].includes(ing.type)
            ? 'bg-blue-500/50'
            : 'bg-slate-500/50'
        }`}
      ></div>
      <div className="min-w-0">
        <div className="text-slate-200 font-medium truncate flex items-center gap-2">
          {safeString(ing.nameZh)}
          {ing.addToSingle && (
            <span className="text-[8px] bg-purple-900/50 text-purple-300 px-1 rounded border border-purple-800">
              單品
            </span>
          )}
        </div>
        <div className="text-slate-500 text-xs truncate flex items-center gap-1">
          <span className="truncate">{safeString(ing.nameEn)}</span>
          {/* 修改：移除 type 限制，只要有 subType 就顯示 */}
          {ing.subType && (
            <span className="shrink-0 text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-400">
              {safeString(ing.subType).split(' ')[0]}
            </span>
          )}
        </div>
      </div>
    </div>
    {!readOnly && (
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right cursor-pointer" onClick={() => onClick(ing)}>
          <div className="text-slate-300 text-sm font-mono">${ing.price}</div>
          <div className="text-slate-600 text-[10px]">
            {ing.volume}
            {safeString(ing.unit) || 'ml'}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(ing.id);
          }}
          className="p-3 -mr-2 text-slate-600 hover:text-rose-500 hover:bg-rose-900/20 rounded-full transition-colors active:scale-95"
        >
          <Trash2 size={20} />
        </button>
      </div>
    )}
  </div>
));

const RecipeCard = memo(({ recipe, ingredients, onClick, role }) => {
  const stats = useMemo(
    () => calculateRecipeStats(recipe, ingredients),
    [recipe, ingredients]
  );
  const isSingle = recipe.type === 'single' || recipe.isIngredient;
  const isFood = recipe.type === 'food'; 
  const isOwnerOrManager = role === 'owner' || role === 'manager';

  const displayPrice = isSingle
    ? recipe.priceGlass || recipe.priceShot || '-'
    : recipe.price || stats.price;

  return (
    <div
      onClick={() => onClick(recipe)}
      className="group bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-800 hover:border-slate-700 transition-all active:scale-[0.98] flex flex-row h-36 w-full cursor-pointer"
    >
      <div className="w-32 h-full relative shrink-0 bg-slate-900">
        <AsyncImage
          imageId={recipe.image}
          alt={safeString(recipe.nameZh)}
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
        />
      </div>
      <div className="flex-1 p-3 flex flex-col justify-between overflow-hidden">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-white leading-tight font-serif tracking-wide truncate pr-2">
              {safeString(recipe.nameZh)}
            </h3>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className="text-amber-400 font-bold text-lg font-mono leading-none">
                ${displayPrice}
              </div>
            </div>
          </div>
          <p className="text-slate-400 text-xs font-medium tracking-wider uppercase truncate opacity-80 mb-1">
            {safeString(recipe.nameEn)}
          </p>
          {recipe.flavorDescription && (
            <div className="text-[10px] text-slate-500 line-clamp-1 italic mb-1.5 opacity-80">
              "{safeString(recipe.flavorDescription)}"
            </div>
          )}
          <div className="flex gap-1 flex-wrap">
            {isFood && (
              <span className="text-[10px] text-emerald-200 bg-emerald-900/40 px-1.5 py-0.5 rounded border border-emerald-800/50">
                {recipe.category ? recipe.category : '餐點'}
              </span>
            )}
            {isSingle ? (
              <span className="text-[10px] text-purple-200 bg-purple-900/40 px-1.5 py-0.5 rounded border border-purple-800/50">
                單品
              </span>
            ) : (
              recipe.baseSpirit && (
                <span className="text-[10px] text-blue-200 bg-blue-900/40 px-1.5 py-0.5 rounded border border-blue-800/50">
                  {safeString(recipe.baseSpirit)}
                </span>
              )
            )}
            {recipe.tags?.slice(0, 2).map((tag) => (
              <span
                key={safeString(tag)}
                className="text-[10px] text-slate-400 bg-slate-700/50 px-1.5 py-0.5 rounded"
              >
                {safeString(tag).split(' ')[0]}
              </span>
            ))}
          </div>
        </div>
        {!isFood && (
          <div className="flex items-center gap-3 text-xs font-mono text-slate-500 pt-1 border-t border-slate-700/50 mt-1">
            {isSingle ? (
              <>
                <span className="text-slate-400">Pure Drink</span>
                <span>|</span>
                <span>
                  {safeNumber(recipe.bottleCapacity) ||
                    safeNumber(recipe.volume)}
                  ml
                </span>
              </>
            ) : (
              <>
                {isOwnerOrManager && (
                  <span
                    className={
                      stats.costRate > 30 ? 'text-rose-400' : 'text-emerald-400'
                    }
                  >
                    CR {stats.costRate.toFixed(0)}%
                  </span>
                )}
                {isOwnerOrManager && <span>|</span>}
                <span>{stats.finalAbv.toFixed(1)}% ABV</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

const ChipSelector = ({ title, options, selected, onSelect }) => {
  const toggle = (opt) => {
    if (selected.includes(opt)) onSelect(selected.filter((s) => s !== opt));
    else onSelect([...selected, opt]);
  };
  return (
    <div className="space-y-2">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-full text-xs transition-all border ${
              selected.includes(opt)
                ? 'bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-900/20'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
            }`}
          >
            {opt.split(' ')[0]}
          </button>
        ))}
      </div>
    </div>
  );
};

const CategoryEditModal = ({
  isOpen,
  onClose,
  onSave,
  availableBases,
  ingCategories,
}) => {
  const [nameZh, setNameZh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [iconType, setIconType] = useState('whisky');
  const [gradient, setGradient] = useState('from-slate-600 to-gray-700');
  const [targetBase, setTargetBase] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNameZh('');
      setNameEn('');
      setTargetBase('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!nameZh) return;
    onSave({
      id: generateId(),
      nameZh,
      nameEn,
      iconType,
      gradient,
      targetBase,
    });
    onClose();
  };

  const handleTargetChange = (e) => {
    const val = e.target.value;
    setTargetBase(val);

    if (!nameZh) {
      if (val === 'TYPE_SOFT') {
        setNameZh('軟性飲料');
        setNameEn('Soft Drink');
      } else if (val.startsWith('TYPE_')) {
        const rawId = val.replace('TYPE_', '');
        const found = ingCategories.find((c) => c.id === rawId);
        if (found) {
          setNameZh(found.label); 
          setNameEn(found.label); 
        }
      } else {
        const parts = val.split(' ');
        if (parts.length > 1) {
          setNameZh(parts[1]);
          setNameEn(parts[0]);
        } else {
          setNameZh(val);
        }
      }
    }
  };

  const gradients = [
    { id: 'blue', val: 'from-blue-600 to-indigo-700' },
    { id: 'amber', val: 'from-amber-600 to-orange-700' },
    { id: 'emerald', val: 'from-emerald-600 to-teal-700' },
    { id: 'rose', val: 'from-rose-600 to-pink-700' },
    { id: 'purple', val: 'from-purple-600 to-violet-700' },
    { id: 'cyan', val: 'from-cyan-600 to-blue-700' },
    { id: 'slate', val: 'from-slate-600 to-gray-700' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">新增分類色塊</h3>
          <button onClick={onClose}>
            <X className="text-slate-400" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-amber-500 uppercase mb-1 block">
              1. 選擇篩選目標
            </label>
            <select
              value={targetBase}
              onChange={handleTargetChange}
              className="w-full bg-slate-800 border border-amber-500/50 rounded-lg p-3 text-white outline-none focus:border-amber-500 appearance-none"
            >
              <option value="" className="text-slate-400">
                -- 請選擇分類 --
              </option>
              <optgroup
                label="特殊分類"
                className="text-amber-500 bg-slate-900"
              >
                <option value="TYPE_SOFT" className="text-white">
                  軟性飲料 (Soft Drink)
                </option>
              </optgroup>

              <optgroup
                label="材料庫分類 (Ingredient Type)"
                className="text-blue-400 bg-slate-900"
              >
                {ingCategories &&
                  ingCategories
                    .filter((c) => !['alcohol', 'soft', 'other'].includes(c.id))
                    .map((c) => (
                      <option
                        key={c.id}
                        value={`TYPE_${c.id}`}
                        className="text-white"
                      >
                        {c.label}
                      </option>
                    ))}
              </optgroup>

              <optgroup
                label="基酒 (Base Spirit)"
                className="text-purple-400 bg-slate-900"
              >
                {availableBases
                  .filter((b) => !b.includes('Soft') && !b.includes('軟'))
                  .map((b) => (
                    <option key={b} value={b} className="text-white">
                      {b}
                    </option>
                  ))}
              </optgroup>
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              選定後，點擊方塊只會顯示該分類的材料。
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">
              2. 中文名稱 (顯示用)
            </label>
            <input
              value={nameZh}
              onChange={(e) => setNameZh(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-amber-500"
              placeholder="例如: 紅白酒"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">
              英文/副標題
            </label>
            <input
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-amber-500"
              placeholder="例如: Wine"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
              選擇圖示
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(ICON_TYPES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setIconType(key)}
                  className={`p-2 rounded-lg border flex items-center justify-center ${
                    iconType === key
                      ? 'bg-slate-700 border-amber-500 text-amber-500'
                      : 'border-slate-700 text-slate-500'
                  }`}
                >
                  {val.component({ width: 20, height: 20 })}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
              選擇顏色
            </label>
            <div className="flex flex-wrap gap-2">
              {gradients.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGradient(g.val)}
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                    g.val
                  } ring-2 ring-offset-2 ring-offset-slate-900 ${
                    gradient === g.val ? 'ring-white' : 'ring-transparent'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="w-full bg-amber-600 text-white font-bold py-3 rounded-xl mt-6"
        >
          建立分類
        </button>
      </div>
    </div>
  );
};

const CategoryGrid = ({
  categories,
  onSelect,
  onAdd,
  onDelete,
  isEditing,
  toggleEditing,
  role,
}) => {
  return (
    <div className="p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          快速分類
        </h3>
        {(role === 'owner' || role === 'manager') && (
          <button
            onClick={toggleEditing}
            className={`text-xs px-2 py-1 rounded border transition-colors ${
              isEditing
                ? 'bg-slate-700 text-white border-slate-500'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            {isEditing ? '完成' : '編輯'}
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat, idx) => (
          <div
            key={cat.id || idx}
            onClick={() => !isEditing && onSelect(cat)}
            className={`relative h-28 rounded-2xl bg-gradient-to-br ${
              cat.gradient || 'from-slate-700 to-slate-800'
            } shadow-lg overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-95 transition-all border border-white/10 group`}
          >
            <div className="absolute -right-2 -bottom-4 w-24 h-24 text-white opacity-20 transform rotate-[-15deg] group-hover:scale-110 group-hover:opacity-30 transition-all duration-500 pointer-events-none">
              <CategoryIcon iconType={cat.iconType} />
            </div>
            <div className="absolute inset-0 p-4 flex flex-col justify-center items-center z-10">
              <span className="text-white font-bold text-xl text-center drop-shadow-md tracking-wide">
                {cat.nameZh}
              </span>
              <span className="text-[10px] text-white/70 font-medium uppercase tracking-wider mt-1 border-t border-white/20 pt-1 px-2">
                {cat.nameEn}
              </span>
            </div>
            {(role === 'owner' || role === 'manager') && isEditing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(cat.id);
                }}
                className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-1.5 shadow-md hover:bg-rose-600 animate-scale-in z-20"
              >
                <X size={14} strokeWidth={3} />
              </button>
            )}
          </div>
        ))}
        {(role === 'owner' || role === 'manager') && (
          <button
            onClick={onAdd}
            className="h-28 rounded-2xl bg-slate-800/50 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:text-white hover:border-slate-500 hover:bg-slate-800 transition-all gap-2 group"
          >
            <div className="p-3 rounded-full bg-slate-800 group-hover:bg-slate-700 transition-colors">
              <Plus size={24} />
            </div>
            <span className="text-xs font-bold">新增分類</span>
          </button>
        )}
      </div>
    </div>
  );
};

const IngredientPickerModal = ({
  isOpen,
  onClose,
  onSelect,
  ingredients,
  categories,
  categorySubItems,
}) => {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [activeSubCat, setActiveSubCat] = useState('all');

  useEffect(() => {
    setActiveSubCat('all');
  }, [activeCat]);
  
  if (!isOpen) return null;

  const currentSubOptions = activeCat !== 'all' && categorySubItems 
    ? (categorySubItems[activeCat] || []) 
    : [];

  const filtered = ingredients.filter((i) => {
    const matchSearch =
      safeString(i.nameZh).toLowerCase().includes(search.toLowerCase()) ||
      safeString(i.nameEn).toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCat === 'all' || i.type === activeCat;
    
    let matchSub = true;
    if (activeCat !== 'all' && activeSubCat !== 'all') {
      matchSub = i.subType === activeSubCat;
    }
    return matchSearch && matchCat && matchSub;
  });

  return (
    <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex flex-col animate-fade-in sm:p-10">
      <div className="bg-slate-950 w-full max-w-lg mx-auto h-full sm:h-auto sm:max-h-[80vh] sm:rounded-2xl flex flex-col border border-slate-800 shadow-2xl overflow-hidden">
        <div className="px-4 pb-4 pt-12 sm:pt-4 border-b border-slate-800 flex items-center gap-3 shrink-0">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400"
          >
            <ChevronLeft />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-slate-200 outline-none focus:border-amber-500"
              placeholder="搜尋材料..."
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 p-4 border-b border-slate-800 shrink-0 bg-slate-950">
          <button
            onClick={() => setActiveCat('all')}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-colors ${
              activeCat === 'all'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'text-slate-400 border-slate-700 bg-slate-900'
            }`}
          >
            全部
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-colors ${
                activeCat === c.id
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'text-slate-400 border-slate-700 bg-slate-900'
              }`}
            >
              {c.label.split(' ')[0]}
            </button>
          ))}
        </div>

        {activeCat !== 'all' && currentSubOptions.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pb-4 border-b border-slate-800 shrink-0 bg-slate-900/50 animate-slide-up pt-2">
            <button
              onClick={() => setActiveSubCat('all')}
              className={`px-3 py-1.5 rounded-full text-[10px] whitespace-nowrap border transition-colors ${
                activeSubCat === 'all'
                  ? 'bg-slate-700 text-white border-slate-500'
                  : 'text-slate-500 border-slate-800 hover:bg-slate-800'
              }`}
            >
              全部
            </button>
            {currentSubOptions.map((b) => (
              <button
                key={b}
                onClick={() => setActiveSubCat(b)}
                className={`px-3 py-1.5 rounded-full text-[10px] whitespace-nowrap border transition-colors ${
                  activeSubCat === b
                    ? 'bg-slate-700 text-white border-slate-500'
                    : 'text-slate-500 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {b.split(' ')[0]}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-slate-950">
          {filtered.map((ing) => (
            <button
              key={ing.id}
              onClick={() => {
                onSelect(ing.id);
                onClose();
              }}
              className="w-full text-left p-3 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-amber-500/50 transition-all flex justify-between items-center group active:bg-slate-800"
            >
              <div>
                <div className="text-slate-200 font-medium">{ing.nameZh}</div>
                <div className="text-slate-500 text-xs">{ing.nameEn}</div>
              </div>
              <div className="flex items-center gap-2">
                {ing.type === 'alcohol' && (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                    {ing.subType ? ing.subType.split(' ')[0] : '基酒'}
                  </span>
                )}
                <Plus
                  size={16}
                  className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-slate-500 py-10">
              沒有找到相關材料
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FoodListScreen = ({
  foodItems,
  searchTerm,
  setSearchTerm,
  startEdit,
  setViewingItem,
  userRole,
  onUnlock,
  foodCategories,
  setFoodCategories,
}) => {
  const [activeCat, setActiveCat] = useState('all');
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const isConsumer = userRole === 'customer';
  const canEdit = userRole === 'owner' || userRole === 'manager';

  const handleAddCategory = () => {
    if (newCatName.trim()) {
      const newCat = { id: generateId(), label: newCatName.trim() };
      setFoodCategories([...foodCategories, newCat]);
      setNewCatName('');
      setIsAddingCat(false);
      setActiveCat(newCat.label);
    }
  };

  const handleDeleteCategory = (catLabel) => {
    if (confirm(`確定刪除分類 "${catLabel}" 嗎？`)) {
      setFoodCategories(foodCategories.filter((c) => c.label !== catLabel));
      if (activeCat === catLabel) setActiveCat('all');
    }
  };

  const filtered = useMemo(() => {
    let list = foodItems.filter(
      (f) =>
        safeString(f.nameZh).includes(searchTerm) ||
        safeString(f.nameEn).toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (activeCat !== 'all') {
      list = list.filter((f) => f.category === activeCat);
    }
    return list;
  }, [foodItems, searchTerm, activeCat]);

  return (
    <div className="h-full flex flex-col w-full bg-slate-950">
      <div className="shrink-0 bg-slate-950/95 backdrop-blur z-20 border-b border-slate-800 shadow-md pt-safe">
        <div className="px-4 py-3 flex gap-2 w-full items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜尋餐點..."
              className="w-full bg-slate-900 text-slate-200 pl-9 pr-4 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500/50 text-sm"
            />
          </div>
          {isConsumer ? (
            <button
              onClick={onUnlock}
              className="p-2 rounded-xl border border-slate-800 text-slate-500 hover:text-white bg-slate-900"
            >
              <Lock size={20} />
            </button>
          ) : (
            canEdit && (
              <button
                onClick={() => startEdit('food')}
                className="bg-amber-600 hover:bg-amber-500 text-white p-2 rounded-xl shadow-lg active:scale-95 transition-all"
              >
                <Plus size={20} />
              </button>
            )
          )}
        </div>

        <div className="flex flex-wrap gap-2 px-4 pb-2 w-full">
          <button
            onClick={() => setActiveCat('all')}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all select-none ${
              activeCat === 'all'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            全部
          </button>
          {foodCategories.map((cat) => (
            <div key={cat.id} className="relative group">
              <button
                onClick={() => setActiveCat(cat.label)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all pr-5 select-none ${
                  activeCat === cat.label
                    ? 'bg-slate-700 text-white border border-amber-500/50 shadow'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
              {canEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(cat.label);
                  }}
                  className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[8px]"
                >
                  <X size={8} strokeWidth={4} />
                </button>
              )}
            </div>
          ))}
          {canEdit &&
            (isAddingCat ? (
              <div className="flex items-center bg-slate-800 rounded-full px-2 py-1 border border-slate-600 animate-fade-in">
                <input
                  autoFocus
                  className="bg-transparent text-sm text-white w-20 outline-none"
                  placeholder="分類名稱"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  onBlur={() => {
                    if (!newCatName) setIsAddingCat(false);
                  }}
                />
                <button
                  onClick={handleAddCategory}
                  className="text-amber-500 ml-1"
                >
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingCat(true)}
                className="p-2 bg-slate-800 rounded-full text-slate-500 hover:text-white hover:bg-slate-700"
              >
                <Plus size={16} />
              </button>
            ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32 custom-scrollbar">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <RecipeCard
              key={item.id}
              recipe={item}
              ingredients={[]}
              onClick={setViewingItem}
              role={userRole}
            />
          ))
        ) : (
          <div className="text-center py-20 text-slate-500 flex flex-col items-center">
            <Utensils size={48} className="mb-4 opacity-20" />
            <p>尚無餐點</p>
          </div>
        )}
      </div>
    </div>
  );
};

const RecipeListScreen = ({
  recipes,
  ingredients,
  searchTerm,
  setSearchTerm,
  recipeCategoryFilter,
  setRecipeCategoryFilter,
  startEdit,
  setViewingItem,
  availableTags,
  categorySubItems,
  userRole,
  onUnlock,
  ingCategories,
}) => {
  const [filterBases, setFilterBases] = useState([]);
  const [filterTags, setFilterTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeBlock, setActiveBlock] = useState(() => {
    try {
      const saved = localStorage.getItem('bar_active_grid_v1');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isGridEditing, setIsGridEditing] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);

  const [gridCategories, setGridCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('bar_grid_cats_v9');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'gin',
        nameZh: 'Gin',
        nameEn: '琴酒',
        iconType: 'martini',
        gradient: 'from-blue-600 to-indigo-700',
        targetBase: 'Gin 琴酒',
      },
      {
        id: 'whisky',
        nameZh: 'Whisky',
        nameEn: '威士忌',
        iconType: 'whisky',
        gradient: 'from-amber-600 to-orange-700',
        targetBase: 'Whisky 威士忌',
      },
      {
        id: 'rum',
        nameZh: 'Rum',
        nameEn: '蘭姆酒',
        iconType: 'highball',
        gradient: 'from-rose-600 to-pink-700',
        targetBase: 'Rum 蘭姆酒',
      },
      {
        id: 'tequila',
        nameZh: 'Tequila',
        nameEn: '龍舌蘭',
        iconType: 'shot',
        gradient: 'from-emerald-600 to-teal-700',
        targetBase: 'Tequila 龍舌蘭',
      },
      {
        id: 'vodka',
        nameZh: 'Vodka',
        nameEn: '伏特加',
        iconType: 'martini',
        gradient: 'from-cyan-600 to-blue-700',
        targetBase: 'Vodka 伏特加',
      },
      {
        id: 'brandy',
        nameZh: 'Brandy',
        nameEn: '白蘭地',
        iconType: 'snifter',
        gradient: 'from-purple-600 to-violet-700',
        targetBase: 'Brandy 白蘭地',
      },
      {
        id: 'soft',
        nameZh: '軟飲',
        nameEn: 'Soft Drink',
        iconType: 'soft',
        gradient: 'from-teal-600 to-emerald-700',
        targetBase: 'TYPE_SOFT',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('bar_grid_cats_v9', JSON.stringify(gridCategories));
  }, [gridCategories]);
  useEffect(() => {
    if (activeBlock)
      localStorage.setItem('bar_active_grid_v1', JSON.stringify(activeBlock));
    else localStorage.removeItem('bar_active_grid_v1');
  }, [activeBlock]);
  useEffect(() => {
    if (searchTerm) setActiveBlock(null);
  }, [searchTerm]);

  const showGrid =
    !searchTerm && !activeBlock && recipeCategoryFilter !== 'all';

  const allSubTypes = useMemo(() => {
      let list = [];
      if(categorySubItems) {
          Object.values(categorySubItems).forEach(subList => {
              if(Array.isArray(subList)) list = [...list, ...subList];
          });
      }
      return list;
  }, [categorySubItems]);

  const handleBlockSelect = (cat) => {
    setActiveBlock(cat);
    const target = cat.targetBase;
    if (target && !target.startsWith('TYPE_')) {
      if (allSubTypes.includes(target)) setFilterBases([target]);
    } else if (!target) {
      const baseMatch = allSubTypes.find(
        (b) => b.includes(cat.nameZh) || b.includes(cat.nameEn)
      );
      if (baseMatch) setFilterBases([baseMatch]);
    }
  };

  const handleAddCategory = (newCat) => {
    if (!newCat.targetBase) {
      if (
        newCat.nameZh.includes('軟') ||
        newCat.nameEn.toLowerCase().includes('soft')
      ) {
        newCat.targetBase = 'TYPE_SOFT';
        newCat.iconType = 'soft';
      }
    }
    setGridCategories([...gridCategories, newCat]);
  };

  const handleDeleteCategory = (id) => {
    if (confirm(`確定移除此方塊嗎？`))
      setGridCategories(gridCategories.filter((c) => c.id !== id));
  };
  const clearBlockFilter = () => {
    setActiveBlock(null);
    setFilterBases([]);
    setFilterTags([]);
  };

  const filtered = useMemo(() => {
    const safeIngs = Array.isArray(ingredients) ? ingredients : [];
    const safeRecipes = Array.isArray(recipes) ? recipes : [];

    const singleIngredients = safeIngs
      .filter((i) => i.addToSingle)
      .map((i) => ({
        ...i,
        category: 'single', 
        type: i.type, 
        baseSpirit: i.subType || '',
        priceShot: i.priceShot || '',
        priceGlass: i.priceGlass || '',
        priceBottle: i.priceBottle || '',
        targetCostRate: i.targetCostRate || 25,
        isIngredient: true,
      }));

    let sourceList = safeRecipes;
    if (recipeCategoryFilter === 'single' || recipeCategoryFilter === 'all') {
      sourceList = [...safeRecipes, ...singleIngredients];
    }

    return sourceList.filter((r) => {
      const matchCat =
        recipeCategoryFilter === 'all' ||
        r.type === recipeCategoryFilter ||
        (recipeCategoryFilter === 'single' && (r.type === 'soft' || r.isIngredient || r.type === 'single')); 
        
      const matchSearch =
        safeString(r.nameZh).includes(searchTerm) ||
        safeString(r.nameEn).toLowerCase().includes(searchTerm.toLowerCase());

      const matchBase =
        filterBases.length === 0 ||
        filterBases.includes(r.baseSpirit) ||
        filterBases.includes(r.subType);
      const matchTags =
        filterTags.length === 0 || filterTags.every((t) => r.tags?.includes(t));

      let matchGrid = true;
      if (activeBlock) {
        let target = activeBlock.targetBase;
        if (!target) {
          const found = allSubTypes.find(
            (b) =>
              b.includes(activeBlock.nameZh) || b.includes(activeBlock.nameEn)
          );
          if (found) target = found;
        }

        if (target) {
          if (target === 'TYPE_SOFT') {
            matchGrid = r.type === 'soft';
          }
          else if (target.startsWith('TYPE_')) {
            const rawType = target.replace('TYPE_', '');
            if (r.isIngredient) {
              matchGrid = r.type === rawType;
            } else {
              matchGrid = false;
            }
          } else {
            matchGrid = r.baseSpirit === target || r.subType === target;
          }
        } else {
          matchGrid = r.tags?.includes(activeBlock.nameZh);
        }
      }

      return matchCat && matchSearch && matchBase && matchTags && matchGrid;
    });
  }, [
    recipes,
    ingredients,
    recipeCategoryFilter,
    searchTerm,
    filterBases,
    filterTags,
    activeBlock,
    allSubTypes,
  ]);

  const isConsumer = userRole === 'customer';
  const canEdit = userRole === 'owner' || userRole === 'manager';

  return (
    <div className="h-full flex flex-col w-full bg-slate-950">
      <div className="shrink-0 bg-slate-950/95 backdrop-blur z-20 border-b border-slate-800 shadow-md pt-safe">
        <div className="px-4 py-3 flex gap-2 w-full items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜尋酒單..."
              className="w-full bg-slate-900 text-slate-200 pl-9 pr-4 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500/50 text-sm"
            />
          </div>
          {!showGrid && recipeCategoryFilter !== 'single' && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl border transition-colors ${
                showFilters || filterBases.length > 0 || filterTags.length > 0
                  ? 'bg-slate-800 border-amber-500/50 text-amber-500'
                  : 'border-slate-800 text-slate-400'
              }`}
            >
              <Filter size={20} />
            </button>
          )}
          {isConsumer ? (
            <button
              onClick={onUnlock}
              className="p-2 rounded-xl border border-slate-800 text-slate-500 hover:text-white bg-slate-900"
            >
              <Lock size={20} />
            </button>
          ) : (
            canEdit && (
              <button
                onClick={() => startEdit('recipe')}
                className="bg-amber-600 hover:bg-amber-500 text-white p-2 rounded-xl shadow-lg active:scale-95 transition-all"
              >
                <Plus size={20} />
              </button>
            )
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 px-4 pb-2 border-b border-slate-800/50 w-full">
          {[
            { id: 'all', label: '全部 All' },
            { id: 'classic', label: '經典 Classic' },
            { id: 'signature', label: '特調 Signature' },
            { id: 'single', label: '單品/純飲 Single' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setRecipeCategoryFilter(cat.id)}
              className={`py-2 px-2 text-xs font-bold border rounded-lg transition-colors select-none flex items-center justify-center gap-1 ${
                recipeCategoryFilter === cat.id
                  ? 'bg-slate-800 text-amber-500 border-amber-500'
                  : 'border-slate-700 text-slate-500 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {showFilters && !showGrid && recipeCategoryFilter !== 'single' && (
          <div className="p-4 bg-slate-900 border-b border-slate-800 animate-slide-up w-full">
            <div className="mb-4">
              <ChipSelector
                title="基酒篩選 (Base)"
                options={allSubTypes}
                selected={filterBases}
                onSelect={setFilterBases}
              />
            </div>
            <div>
              <ChipSelector
                title="風味篩選 (Flavor)"
                options={availableTags}
                selected={filterTags}
                onSelect={setFilterTags}
              />
            </div>
            <div className="mt-4 flex justify-between items-center text-xs text-slate-500">
              <span>找到 {filtered.length} 款酒譜</span>
              <button
                onClick={() => {
                  setFilterBases([]);
                  setFilterTags([]);
                }}
                className="text-rose-400 hover:text-rose-300"
              >
                清除篩選
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {showGrid ? (
          <CategoryGrid
            categories={gridCategories}
            onSelect={handleBlockSelect}
            onAdd={() => setShowCatModal(true)}
            onDelete={handleDeleteCategory}
            isEditing={isGridEditing}
            toggleEditing={() => setIsGridEditing(!isGridEditing)}
            role={userRole}
          />
        ) : (
          <div className="p-4 space-y-4 pb-32">
            {activeBlock && (
              <div className="flex items-center gap-3 mb-4 animate-fade-in">
                <button
                  onClick={clearBlockFilter}
                  className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-200"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <div className="text-xs text-slate-500">正在檢視</div>
                  <div className="text-xl font-bold text-amber-500">
                    {activeBlock.nameZh}
                  </div>
                </div>
              </div>
            )}
            {filtered.length > 0 ? (
              filtered.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  ingredients={ingredients}
                  onClick={setViewingItem}
                  role={userRole}
                />
              ))
            ) : (
              <div className="text-center py-10 text-slate-500 flex flex-col items-center">
                <Filter size={48} className="mb-4 opacity-20" />
                <p>沒有找到符合條件的項目</p>
                {activeBlock && (
                  <button
                    onClick={clearBlockFilter}
                    className="mt-4 text-amber-500 underline"
                  >
                    返回分類
                  </button>
                )}
              </div>
            )}
            <div className="h-10"></div>
          </div>
        )}
      </div>
      <CategoryEditModal
        isOpen={showCatModal}
        onClose={() => setShowCatModal(false)}
        onSave={handleAddCategory}
        availableBases={allSubTypes} 
        ingCategories={ingCategories} 
      />
    </div>
  );
};
const FeaturedSectionScreen = ({
  sections,
  setSections,
  recipes,
  setViewingItem,
  ingredients,
  showConfirm,
  userRole,
  onUnlock,
}) => {
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSubgroupTitle, setNewSubgroupTitle] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [pickingForSubgroupId, setPickingForSubgroupId] = useState(null);
  const [pickerSearch, setPickerSearch] = useState('');

  const isConsumer = userRole === 'customer';
  const canEdit = userRole === 'owner' || userRole === 'manager';

  const syncToCloud = (newSections) => {
    setSections(newSections);
    const shopId = localStorage.getItem('bar_shop_id');
    if (window.firebase && shopId) {
      const db = window.firebase.firestore();
      const batch = db.batch();
      newSections.forEach((sec) => {
        batch.set(
          db.collection('shops').doc(shopId).collection('sections').doc(sec.id),
          sec
        );
      });
      batch.commit().catch((e) => console.error(e));
    }
  };

  const deleteFromCloud = (id) => {
    const shopId = localStorage.getItem('bar_shop_id');
    if (window.firebase && shopId) {
      window.firebase
        .firestore()
        .collection('shops')
        .doc(shopId)
        .collection('sections')
        .doc(id)
        .delete();
    }
  };

  const handleAddSection = () => {
    if (newSectionTitle.trim()) {
      const newSec = {
        id: generateId(),
        title: newSectionTitle.trim(),
        subgroups: [],
      };
      syncToCloud([...sections, newSec]);
      setNewSectionTitle('');
      setIsAdding(false);
    }
  };
  const handleDeleteSection = (id) => {
    showConfirm('刪除專區', '確定刪除此專區？', () => {
      const newSecs = sections.filter((s) => s.id !== id);
      setSections(newSecs);
      deleteFromCloud(id);
      if (activeSectionId === id) setActiveSectionId(null);
    });
  };
  const handleAddSubgroup = (sectionId) => {
    if (newSubgroupTitle.trim()) {
      const updatedSections = sections.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            subgroups: [
              ...s.subgroups,
              {
                id: generateId(),
                title: newSubgroupTitle.trim(),
                recipeIds: [],
              },
            ],
          };
        }
        return s;
      });
      syncToCloud(updatedSections);
      setNewSubgroupTitle('');
      setIsAdding(false);
    }
  };
  const handleDeleteSubgroup = (sectionId, subgroupId) => {
    showConfirm('刪除分類', '確定刪除此分類？', () => {
      const updatedSections = sections.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            subgroups: s.subgroups.filter((sg) => sg.id !== subgroupId),
          };
        }
        return s;
      });
      syncToCloud(updatedSections);
    });
  };
  const handleAddRecipeToSubgroup = (recipeId) => {
    const updatedSections = sections.map((s) => {
      if (s.id === activeSectionId) {
        const updatedSubgroups = s.subgroups.map((sg) => {
          if (
            sg.id === pickingForSubgroupId &&
            !sg.recipeIds.includes(recipeId)
          ) {
            return { ...sg, recipeIds: [...sg.recipeIds, recipeId] };
          }
          return sg;
        });
        return { ...s, subgroups: updatedSubgroups };
      }
      return s;
    });
    syncToCloud(updatedSections);
    setShowPicker(false);
  };
  const handleRemoveRecipeFromSubgroup = (subgroupId, recipeId) => {
    const updatedSections = sections.map((s) => {
      if (s.id === activeSectionId) {
        const updatedSubgroups = s.subgroups.map((sg) => {
          if (sg.id === subgroupId) {
            return {
              ...sg,
              recipeIds: sg.recipeIds.filter((id) => id !== recipeId),
            };
          }
          return sg;
        });
        return { ...s, subgroups: updatedSubgroups };
      }
      return s;
    });
    syncToCloud(updatedSections);
  };

  const activeSection = sections.find((s) => s.id === activeSectionId);

  if (activeSectionId && !activeSection) {
    setActiveSectionId(null);
    return null;
  }

  if (!activeSectionId) {
    return (
      <div className="h-full flex flex-col w-full bg-slate-950">
        <div className="shrink-0 bg-slate-950/95 backdrop-blur z-20 border-b border-slate-800 shadow-md px-4 pt-safe pb-3">
          <div className="flex justify-between items-center mt-3">
            <h2 className="text-2xl font-serif text-slate-100">精選專區</h2>
            <div className="flex gap-3">
              {isConsumer ? (
                <button
                  onClick={onUnlock}
                  className="p-2 rounded-xl border border-slate-800 text-slate-500 hover:text-white bg-slate-900"
                >
                  <Lock size={20} />
                </button>
              ) : (
                canEdit && (
                  <>
                    <button
                      onClick={() => {
                        setIsAdding(!isAdding);
                        setIsEditing(false);
                      }}
                      className={`p-2 rounded-full border transition-all ${
                        isAdding
                          ? 'bg-amber-600 border-amber-500 text-white'
                          : 'text-slate-400 border-slate-700 bg-slate-800'
                      }`}
                    >
                      <Plus size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(!isEditing);
                        setIsAdding(false);
                      }}
                      className={`p-2 rounded-full border transition-all ${
                        isEditing
                          ? 'bg-slate-700 border-slate-500 text-white'
                          : 'text-slate-400 border-slate-700 bg-slate-800'
                      }`}
                    >
                      <Edit3 size={20} />
                    </button>
                  </>
                )
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32 custom-scrollbar">
          {isAdding && (
            <div className="bg-slate-800 p-3 rounded-xl flex gap-2 border border-slate-700 animate-slide-up">
              <input
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="新專區名稱"
                className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white outline-none"
                autoFocus
              />
              <button
                onClick={handleAddSection}
                className="bg-amber-600 text-white px-3 py-2 rounded font-bold text-sm"
              >
                確認
              </button>
            </div>
          )}
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="relative group">
                <div
                  onClick={() => setActiveSectionId(section.id)}
                  className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 cursor-pointer hover:border-amber-500/50 transition-all relative overflow-hidden shadow-lg h-32 flex flex-col justify-center active:scale-[0.98]"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <BookOpen size={80} />
                  </div>
                  <h2 className="text-2xl font-serif text-white font-bold mb-1 relative z-10">
                    {section.title}
                  </h2>
                  <p className="text-slate-500 text-sm relative z-10">
                    {section.subgroups?.length || 0} 個子分類
                  </p>
                </div>
                {canEdit && isEditing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSection(section.id);
                    }}
                    className="absolute -top-2 -right-2 bg-rose-600 text-white p-2 rounded-full shadow-lg z-30 animate-scale-in hover:bg-rose-500"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {sections.length === 0 && !isAdding && (
            <div className="text-center py-20 text-slate-500">
              <FolderPlus size={48} className="mx-auto mb-4 opacity-30" />
              <p>尚無專區</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col w-full bg-slate-950">
      <div className="shrink-0 bg-slate-950/95 backdrop-blur z-20 border-b border-slate-800 shadow-md px-4 pt-safe pb-3">
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => setActiveSectionId(null)}
            className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white border border-slate-700 active:bg-slate-700"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-serif text-white font-bold flex-1 truncate">
            {activeSection.title}
          </h2>
          {isConsumer ? (
            <button
              onClick={onUnlock}
              className="p-2 rounded-xl border border-slate-800 text-slate-500 hover:text-white bg-slate-900"
            >
              <Lock size={18} />
            </button>
          ) : (
            canEdit && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsAdding(!isAdding);
                    setIsEditing(false);
                  }}
                  className={`p-2 rounded-full border transition-all ${
                    isAdding
                      ? 'bg-amber-600 border-amber-500 text-white'
                      : 'text-slate-500 border-slate-700 bg-slate-800'
                  }`}
                >
                  <Plus size={18} />
                </button>
                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setIsAdding(false);
                  }}
                  className={`p-2 rounded-full border transition-all ${
                    isEditing
                      ? 'bg-slate-700 border-slate-500 text-white'
                      : 'text-slate-500 border-slate-700 bg-slate-800'
                  }`}
                >
                  <Edit3 size={18} />
                </button>
              </div>
            )
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 custom-scrollbar">
        {isAdding && (
          <div className="bg-slate-800 p-3 rounded-xl flex gap-2 border border-slate-700 animate-slide-up">
            <input
              value={newSubgroupTitle}
              onChange={(e) => setNewSubgroupTitle(e.target.value)}
              placeholder="新子分類名稱"
              className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white outline-none"
              autoFocus
            />
            <button
              onClick={() => handleAddSubgroup(activeSection.id)}
              className="bg-amber-600 text-white px-3 py-2 rounded font-bold text-sm"
            >
              確認
            </button>
          </div>
        )}
        <div className="space-y-8">
          {activeSection.subgroups.map((subgroup) => (
            <div key={subgroup.id} className="space-y-3 relative">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-lg font-bold text-amber-500">
                  {subgroup.title}
                </h3>
                <div className="flex gap-2">
                  {canEdit && isEditing && (
                    <button
                      onClick={() =>
                        handleDeleteSubgroup(activeSection.id, subgroup.id)
                      }
                      className="text-rose-500 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => {
                        setPickingForSubgroupId(subgroup.id);
                        setShowPicker(true);
                      }}
                      className="text-slate-400 hover:text-white flex items-center gap-1 text-xs bg-slate-800 px-2 py-1 rounded-full border border-slate-700"
                    >
                      <Plus size={12} /> 新增酒譜
                    </button>
                  )}
                </div>
              </div>
              <div className="grid gap-3">
                {subgroup.recipeIds.length > 0 ? (
                  subgroup.recipeIds.map((rid) => {
                    const recipe = recipes.find((r) => r.id === rid);
                    if (!recipe) return null;
                    return (
                      <div key={rid} className="relative group">
                        <RecipeCard
                          recipe={recipe}
                          ingredients={ingredients}
                          onClick={setViewingItem}
                          role={userRole}
                        />
                        {canEdit && isEditing && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveRecipeFromSubgroup(subgroup.id, rid);
                            }}
                            className="absolute top-2 right-2 bg-rose-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-slate-600 italic py-2">
                    此分類尚無酒譜
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {showPicker && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col pt-10 animate-fade-in">
            <div className="bg-slate-900 flex-1 rounded-t-3xl border-t border-slate-700 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">選擇酒譜</h3>
                <button
                  onClick={() => setShowPicker(false)}
                  className="p-2 bg-slate-800 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 bg-slate-900 border-b border-slate-800">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
                  <input
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    placeholder="搜尋名稱..."
                    className="w-full bg-slate-800 text-white pl-9 py-2 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {recipes
                  .filter(
                    (r) =>
                      safeString(r.nameZh).includes(pickerSearch) ||
                      safeString(r.nameEn)
                        .toLowerCase()
                        .includes(pickerSearch.toLowerCase())
                  )
                  .map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleAddRecipeToSubgroup(r.id)}
                      className="w-full text-left p-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-amber-500 flex justify-between items-center group"
                    >
                      <div>
                        <div className="text-white font-medium">{r.nameZh}</div>
                        <div className="text-xs text-slate-500">{r.nameEn}</div>
                      </div>
                      <Plus
                        className="text-amber-500 opacity-0 group-hover:opacity-100"
                        size={16}
                      />
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InventoryScreen = ({
  ingredients,
  startEdit,
  requestDelete,
  ingCategories,
  setIngCategories,
  showConfirm,
  onBatchAdd,
  categorySubItems, // 接收子分類資料結構
  onAddSubCategory, // 接收新增子分類的 function
  isReadOnly,
}) => {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [subCategoryFilter, setSubCategoryFilter] = useState('all');
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [batchCategory, setBatchCategory] = useState('other');
  
  // 新增子分類相關
  const [isAddingSubCat, setIsAddingSubCat] = useState(false);
  const [newSubCatName, setNewSubCatName] = useState('');

  const [sortBy, setSortBy] = useState('name');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setSubCategoryFilter('all');
  }, [categoryFilter]);

  const handleAddCategory = () => {
    if (newCatName.trim()) {
      const newId = generateId();
      setIngCategories([
        ...ingCategories,
        { id: newId, label: newCatName.trim() },
      ]);
      setNewCatName('');
      setIsAddingCat(false);
      setCategoryFilter(newId);
    }
  };
  const deleteCategory = (id) => {
    if (['alcohol', 'soft', 'other'].includes(id)) return;
    showConfirm('刪除分類', '確定刪除此分類？', () => {
      setIngCategories(ingCategories.filter((c) => c.id !== id));
      if (categoryFilter === id) setCategoryFilter('all');
    });
  };
  
  // 處理新增子分類
  const handleAddNewSubCat = () => {
      if(newSubCatName.trim() && onAddSubCategory) {
          onAddSubCategory(categoryFilter, newSubCatName.trim());
          setNewSubCatName('');
          setIsAddingSubCat(false);
      }
  };

  const handleBatchSubmit = () => {
    const lines = batchText.split('\n').filter((line) => line.trim() !== '');
    if (lines.length === 0) return;
    const newItems = lines.map((name) => ({
      id: generateId(),
      nameZh: name.trim(),
      nameEn: '',
      type: batchCategory,
      price: 0,
      volume: 700,
      unit: 'ml',
      abv: 0,
      subType: '',
    }));
    onBatchAdd(newItems);
    setBatchText('');
    setShowBatchModal(false);
  };

  const filteredIngredients = useMemo(() => {
    let list = ingredients.filter((i) => {
      if (categoryFilter !== 'all' && i.type !== categoryFilter) return false;
      
      if (categoryFilter !== 'all' && subCategoryFilter !== 'all') {
        return i.subType === subCategoryFilter;
      }
      
      if (
        search &&
        !(
          (i.nameZh || '').includes(search) ||
          (i.nameEn || '').toLowerCase().includes(search.toLowerCase())
        )
      )
        return false;
      return true;
    });
    if (sortBy === 'name') {
      list.sort((a, b) =>
        (a.nameZh || '').localeCompare(b.nameZh || '', 'zh-Hant')
      );
    } else if (sortBy === 'price') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    return list;
  }, [ingredients, categoryFilter, subCategoryFilter, sortBy, search]);

  const currentSubOptions = categoryFilter !== 'all' && categorySubItems 
    ? (categorySubItems[categoryFilter] || []) 
    : [];

  return (
    <div className="h-full flex flex-col w-full bg-slate-950">
      <div className="shrink-0 bg-slate-950/95 backdrop-blur z-20 border-b border-slate-800 shadow-md px-4 pt-safe pb-0">
        <div className="flex justify-between items-center mb-2 mt-4">
          <h2 className="text-2xl font-serif text-slate-100">材料庫</h2>
          <div className="flex gap-2">
            {!isReadOnly && (
              <button
                onClick={() =>
                  setSortBy((prev) => (prev === 'name' ? 'price' : 'name'))
                }
                className="flex items-center gap-1 bg-slate-800 text-slate-400 px-3 py-2 rounded-full border border-slate-700 text-xs hover:text-white transition-colors"
              >
                {sortBy === 'name' ? (
                  <span className="flex items-center gap-1">
                    <Layers size={14} /> 名稱
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <DollarSign size={14} /> 價格
                  </span>
                )}
              </button>
            )}
            {!isReadOnly && (
              <>
                <button
                  onClick={() => setShowBatchModal(true)}
                  className="flex items-center gap-2 bg-slate-800 text-slate-400 px-3 py-2 rounded-full border border-slate-700 text-sm hover:bg-slate-700 hover:text-white transition-colors"
                  title="批次新增"
                >
                  <FilePlus size={16} />{' '}
                  <span className="hidden sm:inline">批次</span>
                </button>
                <button
                  onClick={() => startEdit('ingredient')}
                  className="flex items-center gap-2 bg-slate-800 text-slate-200 px-4 py-2 rounded-full border border-slate-700 text-sm hover:bg-slate-700 hover:border-amber-500/50 transition-colors"
                >
                  <Plus size={16} /> 新增
                </button>
              </>
            )}
          </div>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋材料名稱..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-8 text-slate-200 text-sm outline-none focus:border-amber-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-2 text-slate-500 p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pb-2 w-full">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all select-none ${
              categoryFilter === 'all'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            全部
          </button>
          {ingCategories.map((cat) => (
            <div key={cat.id} className="relative group">
              <button
                onClick={() => setCategoryFilter(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all pr-5 select-none ${
                  categoryFilter === cat.id
                    ? 'bg-slate-700 text-white border border-amber-500/50 shadow'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
              {!isReadOnly &&
                !['alcohol', 'soft', 'other'].includes(cat.id) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCategory(cat.id);
                    }}
                    className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[8px]"
                  >
                    <X size={8} strokeWidth={4} />
                  </button>
                )}
            </div>
          ))}
          {!isReadOnly &&
            (isAddingCat ? (
              <div className="flex items-center bg-slate-800 rounded-full px-2 py-1 border border-slate-600 animate-fade-in">
                <input
                  autoFocus
                  className="bg-transparent text-sm text-white w-20 outline-none"
                  placeholder="分類名稱"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  onBlur={() => {
                    if (!newCatName) setIsAddingCat(false);
                  }}
                />
                <button
                  onClick={handleAddCategory}
                  className="text-amber-500 ml-1"
                >
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingCat(true)}
                className="p-2 bg-slate-800 rounded-full text-slate-500 hover:text-white hover:bg-slate-700"
              >
                <Plus size={16} />
              </button>
            ))}
        </div>
        
        {categoryFilter !== 'all' && (
          <div className="flex flex-wrap gap-2 pb-2 mt-2 w-full animate-slide-up bg-slate-900/30 p-2 rounded-lg">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider py-1.5 flex items-center">
              細項:
            </span>
            <button
              onClick={() => setSubCategoryFilter('all')}
              className={`whitespace-nowrap px-3 py-1.5 rounded text-xs font-medium transition-colors border ${
                subCategoryFilter === 'all'
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              全部
            </button>
            {currentSubOptions.map((subItem) => (
              <button
                key={subItem}
                onClick={() => setSubCategoryFilter(subItem)}
                className={`whitespace-nowrap px-3 py-1.5 rounded text-xs font-medium transition-colors border ${
                  subCategoryFilter === subItem
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {safeString(subItem).split(' ')[0]}
              </button>
            ))}
            
            {!isReadOnly && (
                isAddingSubCat ? (
                    <div className="flex items-center bg-slate-800 rounded px-2 py-1 border border-slate-600 animate-fade-in h-[26px]">
                        <input
                          autoFocus
                          className="bg-transparent text-xs text-white w-20 outline-none"
                          placeholder="新子分類"
                          value={newSubCatName}
                          onChange={(e) => setNewSubCatName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddNewSubCat()}
                          onBlur={() => {
                            if (!newSubCatName) setIsAddingSubCat(false);
                          }}
                        />
                        <button
                          onClick={handleAddNewSubCat}
                          className="text-amber-500 ml-1"
                        >
                          <Check size={12} />
                        </button>
                    </div>
                ) : (
                    <button
                      onClick={() => setIsAddingSubCat(true)}
                      className="px-2 py-1.5 rounded text-xs font-medium border border-slate-700 border-dashed text-slate-500 hover:text-amber-500 hover:border-amber-500 transition-colors"
                    >
                      +
                    </button>
                )
            )}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-32 custom-scrollbar">
        {filteredIngredients.map((ing) => (
          <IngredientRow
            key={ing.id}
            ing={ing}
            onClick={() => !isReadOnly && startEdit('ingredient', ing)}
            onDelete={(id) => requestDelete(id, 'ingredient')}
            readOnly={isReadOnly}
          />
        ))}
        {filteredIngredients.length === 0 && (
          <div className="text-center py-10 text-slate-500 flex flex-col items-center">
            <Layers size={40} className="mb-2 opacity-20" />
            <span>沒有找到材料</span>
          </div>
        )}
      </div>
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-scale-in flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FilePlus size={20} /> 批次新增材料
              </h3>
              <button
                onClick={() => setShowBatchModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              請輸入材料名稱，一行一個。新增後預設價格為 $0，可稍後再編輯。
            </p>
            <textarea
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder={`例如:\n金巴利\n甜香艾酒\n蘇打水`}
              className="flex-1 bg-slate-800 border border-slate-600 rounded-xl p-3 text-slate-200 focus:border-amber-500 outline-none resize-none mb-4 h-48"
              autoFocus
            />
            <div className="mb-4">
              <label className="text-xs text-slate-500 font-bold uppercase block mb-1">
                預設分類
              </label>
              <div className="flex gap-2">
                {ingCategories.slice(0, 3).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setBatchCategory(cat.id)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                      batchCategory === cat.id
                        ? 'bg-slate-700 border-amber-500 text-white'
                        : 'border-slate-700 text-slate-500'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleBatchSubmit}
              disabled={!batchText.trim()}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-900/20"
            >
              確認新增{' '}
              {batchText.split('\n').filter((l) => l.trim()).length > 0
                ? `(${batchText.split('\n').filter((l) => l.trim()).length} 筆)`
                : ''}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const QuickCalcScreen = ({ ingredients, availableBases, onCreateRecipe }) => {
  const [mode, setMode] = useState('single');
  const [price, setPrice] = useState('');
  const [volume, setVolume] = useState(700);
  const [targetCostRate, setTargetCostRate] = useState(25);
  const [draftIngs, setDraftIngs] = useState([]);
  const [technique, setTechnique] = useState('Stir');
  const [showIngPicker, setShowIngPicker] = useState(false);
  const addDraftIng = (ingId) => {
    if (!ingId) return;
    setDraftIngs([...draftIngs, { id: ingId, amount: 30 }]);
  };
  const updateDraftAmount = (idx, val) => {
    const newIngs = [...draftIngs];
    newIngs[idx].amount = val;
    setDraftIngs(newIngs);
  };
  const removeDraftIng = (idx) => {
    setDraftIngs(draftIngs.filter((_, i) => i !== idx));
  };
  const draftStats = useMemo(
    () =>
      calculateRecipeStats({ ingredients: draftIngs, technique }, ingredients),
    [draftIngs, technique, ingredients]
  );
  const suggestedPrice =
    draftStats.cost > 0
      ? Math.ceil(draftStats.cost / (targetCostRate / 100) / 10) * 10
      : 0;
  
  const handleCreateRecipe = () => {
    if (draftIngs.length === 0) return alert('請先加入材料');
    const recipeData = {
      ingredients: draftIngs,
      technique,
      targetCostRate,
      price: suggestedPrice,
    };
    if(onCreateRecipe) onCreateRecipe(recipeData);
  };

  const ingCategories = [
    { id: 'alcohol', label: '基酒 Alcohol' },
    { id: 'soft', label: '軟性飲料 Soft' },
    { id: 'other', label: '其他 Other' },
  ];
  return (
    <div className="h-full flex flex-col animate-fade-in text-slate-200 w-full bg-slate-950">
      <div className="shrink-0 bg-slate-950/95 backdrop-blur z-20 border-b border-slate-800 p-4 pt-safe">
        <h2 className="text-xl font-serif mb-4 mt-4">成本計算工具</h2>
        <div className="flex bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setMode('single')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all select-none ${
              mode === 'single'
                ? 'bg-slate-700 text-white shadow'
                : 'text-slate-500'
            }`}
          >
            純飲速算 (列表)
          </button>
          <button
            onClick={() => setMode('draft')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all select-none ${
              mode === 'draft'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-500'
            }`}
          >
            雞尾酒草稿 (Draft)
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24 custom-scrollbar">
        {mode === 'single' ? (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    單瓶成本 ($)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="800"
                    className="w-full p-3 bg-slate-800 rounded-xl border border-slate-700 outline-none focus:border-amber-500 text-white font-mono text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    容量 (ml)
                  </label>
                  <input
                    type="number"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="w-full p-3 bg-slate-800 rounded-xl border border-slate-700 outline-none focus:border-amber-500 text-white font-mono text-lg"
                  />
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    目標成本率 (Cost Rate)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setTargetCostRate(Math.max(10, targetCostRate - 5))
                      }
                      className="w-6 h-6 rounded bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-700 hover:text-white"
                    >
                      -
                    </button>
                    <span className="text-amber-500 font-bold font-mono w-8 text-center">
                      {targetCostRate}%
                    </span>
                    <button
                      onClick={() =>
                        setTargetCostRate(Math.min(100, targetCostRate + 5))
                      }
                      className="w-6 h-6 rounded bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-700 hover:text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="1"
                  value={targetCostRate}
                  onChange={(e) => setTargetCostRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>
            <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-lg shadow-black/20">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-700">
                    <th className="p-4 text-left font-bold text-slate-400">
                      規格
                    </th>
                    <th className="p-4 text-right font-bold text-slate-400">
                      成本
                    </th>
                    <th className="p-4 text-right font-bold text-amber-500">
                      建議售價
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {[
                    { label: '1 ml', vol: 1 },
                    { label: '30 ml (Shot)', vol: 30 },
                    { label: '50 ml (Single)', vol: 50 },
                    { label: '60 ml (Double)', vol: 60 },
                    { label: '整瓶 (Bottle)', vol: safeNumber(volume) || 700 },
                  ].map((row, idx) => {
                    const p = safeNumber(price);
                    const v = safeNumber(volume) || 1;
                    const cost = (p / v) * row.vol;
                    const rate = safeNumber(targetCostRate) / 100 || 0.25;
                    const suggested =
                      p > 0 ? Math.ceil(cost / rate / 10) * 10 : 0;
                    return (
                      <tr
                        key={idx}
                        className="hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="p-4 text-slate-200 font-medium">
                          {row.label}
                          {idx === 4 && (
                            <span className="block text-[10px] text-slate-500 font-normal">
                              Based on {targetCostRate}% CR
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right text-slate-400 font-mono">
                          ${cost.toFixed(1)}
                        </td>
                        <td className="p-4 text-right">
                          <div className="text-amber-400 font-bold font-mono text-lg">
                            ${suggested}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                調製法
              </label>
              <div className="flex gap-2">
                {['Shake', 'Stir', 'Build'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTechnique(t)}
                    className={`flex-1 py-2 rounded-lg text-sm border ${
                      technique === t
                        ? 'bg-slate-700 border-amber-500 text-white'
                        : 'border-slate-700 text-slate-500'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {draftIngs.map((item, idx) => {
                const ing = ingredients.find((i) => i.id === item.id);
                return (
                  <div
                    key={idx}
                    className="flex gap-2 items-center animate-slide-up"
                  >
                    <div className="flex-1 p-3 bg-slate-800 rounded-xl border border-slate-700 text-sm">
                      {ing?.nameZh}
                    </div>
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) =>
                        updateDraftAmount(idx, Number(e.target.value))
                      }
                      className="w-20 p-3 bg-slate-800 rounded-xl border border-slate-700 text-center font-mono outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={() => removeDraftIng(idx)}
                      className="p-3 text-rose-500 bg-slate-800 rounded-xl border border-slate-700 hover:bg-rose-900/20"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
              <button
                onClick={() => setShowIngPicker(true)}
                className="w-full p-3 bg-slate-800/50 border border-dashed border-slate-600 rounded-xl text-slate-400 hover:text-white hover:border-slate-400 transition-colors text-center flex items-center justify-center gap-2"
              >
                <Plus size={16} /> 加入材料
              </button>
            </div>
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  目標成本率 (Cost Rate)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setTargetCostRate(Math.max(10, targetCostRate - 5))
                    }
                    className="w-6 h-6 rounded bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-700 hover:text-white"
                  >
                    -
                  </button>
                  <span className="text-amber-500 font-bold font-mono w-8 text-center">
                    {targetCostRate}%
                  </span>
                  <button
                    onClick={() =>
                      setTargetCostRate(Math.min(100, targetCostRate + 5))
                    }
                    className="w-6 h-6 rounded bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-700 hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                step="1"
                value={targetCostRate}
                onChange={(e) => setTargetCostRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 mt-4 shadow-xl">
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">總成本</div>
                  <div className="text-2xl font-mono text-rose-400 font-bold">
                    ${draftStats.cost}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 mb-1">
                    總容量 (含融水)
                  </div>
                  <div className="text-2xl font-mono text-blue-400 font-bold">
                    {draftStats.volume}ml
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
                <span className="text-slate-400 text-sm">預估酒精濃度</span>
                <span className="text-xl font-bold text-amber-500">
                  {draftStats.finalAbv.toFixed(1)}%
                </span>
              </div>
              <div className="pt-2 flex justify-between items-center border-t border-slate-700/50 mt-2">
                <span className="text-slate-400 text-sm">建議售價</span>
                <span className="text-2xl font-bold text-emerald-400 font-mono">
                  ${suggestedPrice}
                </span>
              </div>
            </div>
            <button
               onClick={handleCreateRecipe}
               className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold rounded-xl shadow-lg mt-4 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
               <Play size={20} fill="currentColor" /> ✨ 將此草稿建立為酒譜
            </button>
          </div>
        )}
      </div>
      <IngredientPickerModal
        isOpen={showIngPicker}
        onClose={() => setShowIngPicker(false)}
        onSelect={addDraftIng}
        ingredients={ingredients}
        categories={ingCategories}
        availableBases={availableBases}
      />
    </div>
  );
};

const EditorSheet = ({
  mode,
  item,
  setItem,
  onSave,
  onClose,
  ingredients,
  availableTechniques,
  setAvailableTechniques,
  availableTags,
  setAvailableTags,
  availableGlasses,
  setAvailableGlasses,
  availableBases,
  categorySubItems, 
  onAddSubCategory, 
  requestDelete,
  ingCategories,
  setIngCategories,
  showAlert,
  foodCategories,
  setFoodCategories,
}) => {
  const fileInputRef = useRef(null);
  const [addingItem, setAddingItem] = useState(null);
  const [newItemValue, setNewItemValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showIngPicker, setShowIngPicker] = useState(false);
  const [pickerTargetIndex, setPickerTargetIndex] = useState(null);

  if (!mode || !item) return null;

  const handleAddItem = () => {
    if (!newItemValue.trim()) return;
    const val = newItemValue.trim();

    if (addingItem === 'technique')
      setAvailableTechniques([...availableTechniques, val]);
    if (addingItem === 'glass') setAvailableGlasses([...availableGlasses, val]);
    if (addingItem === 'tag') setAvailableTags([...availableTags, val]);

    if (addingItem === 'base' || addingItem === 'subType') {
      const targetCategory = mode === 'ingredient' ? item.type : 'alcohol'; 
      if(onAddSubCategory) {
          onAddSubCategory(targetCategory, val);
      }
      
      if (mode === 'ingredient') setItem({ ...item, subType: val });
      if (mode === 'recipe') setItem({ ...item, baseSpirit: val });
    }

    if (addingItem === 'foodCat') {
      const newCat = { id: generateId(), label: val };
      setFoodCategories([...foodCategories, newCat]);
      setItem({ ...item, category: val });
    }

    setAddingItem(null);
    setNewItemValue('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    e.target.value = null;

    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      if (showAlert) showAlert('錯誤', '圖片太大，請選擇小於 10MB 的照片');
      else alert('圖片太大');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
        setItem({ ...item, image: dataUrl });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRecipeIngChange = (idx, field, value) => {
    const newIngs = item.ingredients.map((ing, i) => {
      if (i === idx) return { ...ing, [field]: value };
      return ing;
    });
    setItem({ ...item, ingredients: newIngs });
  };

  const addRecipeIng = () => {
    setItem({
      ...item,
      ingredients: [...item.ingredients, { id: '', amount: 0 }],
    });
  };
  const removeRecipeIng = (idx) => {
    const newIngs = item.ingredients.filter((_, i) => i !== idx);
    setItem({ ...item, ingredients: newIngs });
  };
  const toggleTag = (tag) => {
    const tags = item.tags || [];
    if (tags.includes(tag))
      setItem({ ...item, tags: tags.filter((t) => t !== tag) });
    else setItem({ ...item, tags: [...tags, tag] });
  };
  const handleSaveWrapper = async () => {
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };
  const stats =
    mode === 'recipe' ? calculateRecipeStats(item, ingredients) : null;
  const isSingle = item.type === 'single';
  const isFood = mode === 'food';

  const handleCostRateChange = (valStr) => {
    const val = parseFloat(valStr);
     
    if(mode === 'recipe' && !isSingle && !isFood) {
        if(!isNaN(val) && val > 0 && stats.cost > 0) {
            const newPrice = Math.ceil(stats.cost / (val/100) / 10) * 10;
            setItem({ ...item, targetCostRate: val, price: newPrice });
        } else {
             setItem({ ...item, targetCostRate: valStr }); 
        }
        return;
    }

    if (valStr === '') {
      const newItem = { ...item, targetCostRate: '' };
      setItem(newItem);
      return;
    }
    const newItem = { ...item, targetCostRate: val };

    if (!isNaN(val)) {
      if (mode === 'ingredient' && item.addToSingle) {
        setItem(autoCalcPricesForIngredient(newItem));
      } else if (mode === 'recipe' && isSingle) {
        setItem(autoCalcPricesForSingleRecipe(newItem));
      } else {
        setItem(newItem);
      }
    } else {
      setItem(newItem);
    }
  };
   
  const handlePriceChange = (valStr) => {
      const val = parseFloat(valStr);
      if(mode === 'recipe' && !isSingle && !isFood) {
          if(!isNaN(val) && val > 0 && stats.cost > 0) {
              const newRate = (stats.cost / val) * 100;
              setItem({ ...item, price: val, targetCostRate: parseFloat(newRate.toFixed(1)) });
          } else {
              setItem({ ...item, price: valStr });
          }
          return;
      }
      setItem({ ...item, price: val });
  };

  const autoCalcPricesForIngredient = (currentItem) => {
    if (!currentItem.addToSingle) return currentItem;
    const price = safeNumber(currentItem.price);
    const vol = safeNumber(currentItem.volume);
    const rate = safeNumber(currentItem.targetCostRate) || 25;
    if (price <= 0 || vol <= 0 || rate <= 0) return currentItem;
    const costPerMl = price / vol;
    const rateDecimal = rate / 100;
    return {
      ...currentItem,
      priceShot: Math.ceil((costPerMl * 30) / rateDecimal / 5) * 5,
      priceGlass: Math.ceil((costPerMl * 50) / rateDecimal / 5) * 5,
      priceBottle: Math.ceil((price / rateDecimal / 10) * 10),
    };
  };
  const autoCalcPricesForSingleRecipe = (currentItem) => {
    if (currentItem.type !== 'single') return currentItem;
    const price = safeNumber(currentItem.bottleCost);
    const vol = safeNumber(currentItem.bottleCapacity);
    const rate = safeNumber(currentItem.targetCostRate) || 25;
    if (price <= 0 || vol <= 0 || rate <= 0) return currentItem;
    const costPerMl = price / vol;
    const rateDecimal = rate / 100;
    return {
      ...currentItem,
      priceShot: Math.ceil((costPerMl * 30) / rateDecimal / 5) * 5,
      priceGlass: Math.ceil((costPerMl * 50) / rateDecimal / 5) * 5,
      priceBottle: Math.ceil((price / rateDecimal / 10) * 10),
    };
  };
  const handlePickerSelect = (id) => {
    if (pickerTargetIndex !== null) {
      handleRecipeIngChange(pickerTargetIndex, 'id', id);
    }
    setPickerTargetIndex(null);
  };

  const currentSubOptions = (mode === 'ingredient' && categorySubItems) 
    ? (categorySubItems[item.type] || [])
    : (categorySubItems['alcohol'] || []);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full md:w-[600px] bg-slate-900 h-full shadow-2xl flex flex-col animate-slide-up border-l border-slate-800">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900 z-10 pt-safe">
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X size={24} />
          </button>
          <h2 className="text-lg font-bold text-white font-serif">
            {mode === 'recipe'
              ? '編輯酒譜'
              : mode === 'food'
              ? '編輯餐點'
              : '編輯材料'}
          </h2>
          <button
            onClick={handleSaveWrapper}
            disabled={isSaving}
            className="p-2 text-amber-500 hover:text-amber-400 bg-amber-900/20 rounded-full hover:bg-amber-900/40 transition disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCcw className="animate-spin" size={24} />
            ) : (
              <Check size={24} />
            )}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-safe-offset custom-scrollbar">
          <div className="space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 bg-slate-800 rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer transition-colors hover:border-slate-500 active:scale-[0.99]"
            >
              {item.image ? (
                <>
                  {item.image.startsWith('data:') ? (
                    <img
                      src={item.image}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                  ) : (
                    <AsyncImage
                      imageId={item.image}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-bold flex items-center gap-2">
                      <Camera size={18} /> 更換照片
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-slate-500 flex flex-col items-center">
                  <div className="p-4 bg-slate-700/50 rounded-full mb-2">
                    <Camera size={32} />
                  </div>
                  <span className="text-xs font-bold">點擊拍照或上傳</span>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                {mode === 'ingredient' ? '材料中文名稱' : '調酒中文名稱'}
              </label>
              <input
                value={item.nameZh}
                onChange={(e) => setItem({ ...item, nameZh: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none"
                placeholder={mode === 'ingredient' ? "例如: 琴酒" : "例如: 內格羅尼"}
              />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                {mode === 'ingredient' ? '材料英文名稱' : '調酒英文名稱'}
              </label>
              <input
                value={item.nameEn}
                onChange={(e) => setItem({ ...item, nameEn: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none"
                placeholder={mode === 'ingredient' ? "e.g. Gin" : "e.g. Negroni"}
              />
            </div>

            {!isFood && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                   {mode === 'recipe' ? '風格分類' : '分類'}
                </label>
                <select
                  value={item.type}
                  onChange={(e) => setItem({ ...item, type: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-amber-500 appearance-none"
                >
                  {mode === 'recipe' ? (
                    <>
                      <option value="classic">經典 Classic</option>
                      <option value="signature">特調 Signature</option>
                      <option value="single">單品/純飲 Single</option>
                    </>
                  ) : (
                    ingCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            {isFood && (
              <div className="space-y-1 animate-fade-in">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    餐點分類
                  </label>
                  <button
                    onClick={() => {
                      setAddingItem('foodCat');
                      setNewItemValue('');
                    }}
                    className="text-[10px] text-amber-500 hover:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded"
                  >
                    + 自訂
                  </button>
                </div>
                {addingItem === 'foodCat' ? (
                  <div className="flex gap-2 h-[46px] items-center animate-slide-up">
                    <input
                      autoFocus
                      value={newItemValue}
                      onChange={(e) => setNewItemValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                      className="w-full bg-slate-800 border border-amber-500 rounded px-2 py-1 text-xs text-white outline-none"
                      placeholder="輸入新分類..."
                    />
                    <button
                      onClick={handleAddItem}
                      className="bg-amber-600 text-white px-2 py-1 rounded text-xs font-bold shrink-0"
                    >
                      V
                    </button>
                    <button
                      onClick={() => setAddingItem(null)}
                      className="text-slate-400 p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={item.category || ''}
                      onChange={(e) =>
                        setItem({ ...item, category: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-amber-500 appearance-none"
                    >
                      <option value="">-- 未分類 --</option>
                      {foodCategories.map((c) => (
                        <option key={c.id} value={c.label}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-3.5 pointer-events-none text-slate-500">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            )}

            {mode === 'ingredient' && (
              <div className="space-y-1 animate-fade-in">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    細項分類
                  </label>
                  <button
                    onClick={() => {
                      setAddingItem('subType');
                      setNewItemValue('');
                    }}
                    className="text-[10px] text-amber-500 hover:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded"
                  >
                    + 自訂
                  </button>
                </div>
                {addingItem === 'subType' ? (
                  <div className="flex gap-2 h-[46px] items-center animate-slide-up">
                    <input
                      autoFocus
                      value={newItemValue}
                      onChange={(e) => setNewItemValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                      className="w-full bg-slate-800 border border-amber-500 rounded px-2 py-1 text-xs text-white outline-none"
                      placeholder="輸入新分類..."
                    />
                    <button
                      onClick={handleAddItem}
                      className="bg-amber-600 text-white px-2 py-1 rounded text-xs font-bold shrink-0"
                    >
                      V
                    </button>
                    <button
                      onClick={() => setAddingItem(null)}
                      className="text-slate-400 p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={item.subType || ''}
                      onChange={(e) =>
                        setItem({ ...item, subType: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-amber-500 appearance-none"
                    >
                      <option value="">-- 無 --</option>
                      {currentSubOptions.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-3.5 pointer-events-none text-slate-500">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            )}

            {mode === 'recipe' && !isSingle && !isFood && (
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    基酒分類
                  </label>
                  <button
                    onClick={() => {
                      setAddingItem('base');
                      setNewItemValue('');
                    }}
                    className="text-[10px] text-amber-500"
                  >
                    新增
                  </button>
                </div>
                {addingItem === 'base' ? (
                  <div className="flex gap-2 h-[46px] items-center">
                    <input
                      autoFocus
                      value={newItemValue}
                      onChange={(e) => setNewItemValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                      className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                      placeholder="輸入新基酒..."
                    />
                    <button
                      onClick={handleAddItem}
                      className="bg-amber-600 text-white px-2 py-1 rounded text-xs font-bold shrink-0"
                    >
                      V
                    </button>
                    <button
                      onClick={() => setAddingItem(null)}
                      className="text-slate-400 p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <select
                    value={item.baseSpirit}
                    onChange={(e) =>
                      setItem({ ...item, baseSpirit: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-amber-500 appearance-none"
                  >
                    <option value="">其他</option>
                    {(categorySubItems['alcohol'] || []).map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          {isFood && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  價格 ($)
                </label>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    setItem({ ...item, price: Number(e.target.value) })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none font-mono"
                  placeholder="250"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  風味描述 / 內容物
                </label>
                <textarea
                  value={item.flavorDescription}
                  onChange={(e) =>
                    setItem({ ...item, flavorDescription: e.target.value })
                  }
                  className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-amber-500 resize-none"
                  placeholder="描述口感或主要食材..."
                />
              </div>
            </div>
          )}

          {mode === 'ingredient' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    價格 ($)
                  </label>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      setItem(
                        autoCalcPricesForIngredient({
                          ...item,
                          price: Number(e.target.value),
                        })
                      )
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    容量 (ml)
                  </label>
                  <input
                    type="number"
                    value={item.volume}
                    onChange={(e) =>
                      setItem(
                        autoCalcPricesForIngredient({
                          ...item,
                          volume: Number(e.target.value),
                        })
                      )
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    酒精度 (%)
                  </label>
                  <input
                    type="number"
                    value={item.abv}
                    onChange={(e) =>
                      setItem({ ...item, abv: Number(e.target.value) })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Beer size={16} className="text-amber-500" /> 顯示於單品酒單
                  </label>
                  <button
                    onClick={() => {
                      const newState = !item.addToSingle;
                      if (newState) {
                        setItem(
                          autoCalcPricesForIngredient({
                            ...item,
                            addToSingle: newState,
                            targetCostRate: item.targetCostRate || 25,
                          })
                        );
                      } else {
                        setItem({ ...item, addToSingle: newState });
                      }
                    }}
                    className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${
                      item.addToSingle
                        ? 'bg-amber-600 justify-end'
                        : 'bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                  </button>
                </div>
                {item.addToSingle && (
                  <div className="space-y-4 animate-slide-up">
                    <div className="flex justify-between items-center bg-slate-900 p-2 rounded-lg border border-slate-700">
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                        <Percent size={12} /> 目標成本率
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={item.targetCostRate}
                          onChange={(e) => handleCostRateChange(e.target.value)}
                          className="w-12 text-center bg-transparent text-amber-500 font-mono font-bold outline-none border-b border-slate-700 focus:border-amber-500"
                        />
                        <span className="text-xs text-slate-500">%</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="text-xs text-slate-400 w-24">
                          Shot (30ml)
                        </label>
                        <input
                          type="number"
                          value={item.priceShot || ''}
                          onChange={(e) =>
                            setItem({ ...item, priceShot: e.target.value })
                          }
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-amber-500"
                          placeholder="自訂售價"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-xs text-slate-400 w-24">
                          單杯 (50ml)
                        </label>
                        <input
                          type="number"
                          value={item.priceGlass || ''}
                          onChange={(e) =>
                            setItem({ ...item, priceGlass: e.target.value })
                          }
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-amber-500"
                          placeholder="自訂售價"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-xs text-slate-400 w-24">
                          整瓶 Bottle
                        </label>
                        <input
                          type="number"
                          value={item.priceBottle || ''}
                          onChange={(e) =>
                            setItem({ ...item, priceBottle: e.target.value })
                          }
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-amber-500"
                          placeholder="自訂售價"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {mode === 'recipe' && !isSingle && (
            <div className="space-y-6">
              {isSingle ? (
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-4">
                  <h3 className="text-amber-500 font-bold text-sm flex items-center gap-2">
                    <DollarSign size={16} /> 單品成本設定
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        進貨價格 ($)
                      </label>
                      <input
                        type="number"
                        value={item.bottleCost}
                        onChange={(e) =>
                          setItem(
                            autoCalcPricesForSingleRecipe({
                              ...item,
                              bottleCost: e.target.value,
                            })
                          )
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none font-mono"
                        placeholder="2000"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        瓶身容量 (ml)
                      </label>
                      <input
                        type="number"
                        value={item.bottleCapacity}
                        onChange={(e) =>
                          setItem(
                            autoCalcPricesForSingleRecipe({
                              ...item,
                              bottleCapacity: e.target.value,
                            })
                          )
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none font-mono"
                        placeholder="700"
                      />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800"></div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-amber-500 font-bold text-sm flex items-center gap-2">
                      <Calculator size={16} /> 自訂售價
                    </h3>
                    <div className="flex items-center gap-2 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                      <span className="text-[10px] text-slate-400">
                        Target CR:
                      </span>
                      <input
                        type="number"
                        value={item.targetCostRate}
                        onChange={(e) => handleCostRateChange(e.target.value)}
                        className="w-8 bg-transparent text-xs text-amber-500 font-bold text-center outline-none"
                      />
                      <span className="text-[10px] text-slate-500">%</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-slate-400 w-24">
                        Shot (30ml)
                      </label>
                      <input
                        type="number"
                        value={item.priceShot}
                        onChange={(e) =>
                          setItem({ ...item, priceShot: e.target.value })
                        }
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-amber-500"
                        placeholder="自動計算..."
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-slate-400 w-24">
                        單杯 (50ml)
                      </label>
                      <input
                        type="number"
                        value={item.priceGlass}
                        onChange={(e) =>
                          setItem({ ...item, priceGlass: e.target.value })
                        }
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-amber-500"
                        placeholder="自動計算..."
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-slate-400 w-24">
                        整瓶 Bottle
                      </label>
                      <input
                        type="number"
                        value={item.priceBottle}
                        onChange={(e) =>
                          setItem({ ...item, priceBottle: e.target.value })
                        }
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-amber-500"
                        placeholder="自動計算..."
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      酒譜材料
                    </label>
                    {/* 修正：將新增材料按鈕放大 */}
                    <button
                      onClick={addRecipeIng}
                      className="w-full p-3 bg-slate-800/50 border border-dashed border-slate-600 rounded-xl text-slate-400 hover:text-white hover:border-slate-400 transition-colors text-center flex items-center justify-center gap-2 mb-2"
                    >
                      <Plus size={16} /> 加入材料
                    </button>
                  </div>
                  <div className="space-y-2">
                    {item.ingredients &&
                      item.ingredients.map((ingItem, idx) => (
                        <div
                          key={idx}
                          className="flex gap-2 items-center animate-slide-up"
                        >
                          <button
                            onClick={() => {
                              setPickerTargetIndex(idx);
                              setShowIngPicker(true);
                            }}
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white text-left truncate hover:border-amber-500 transition-colors"
                          >
                            {ingredients.find((i) => i.id === ingItem.id)
                              ?.nameZh || (
                              <span className="text-slate-500">
                                選擇材料...
                              </span>
                            )}
                          </button>
                          {/* 修正：輸入框加大並加上單位提示 */}
                          <div className="relative w-24">
                              <input
                                type="number"
                                value={ingItem.amount}
                                onChange={(e) =>
                                  handleRecipeIngChange(
                                    idx,
                                    'amount',
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 pr-8 text-sm text-center text-white outline-none focus:border-amber-500 font-mono"
                                placeholder="0"
                              />
                              <span className="absolute right-2 top-3 text-xs text-slate-500 pointer-events-none">ml</span>
                          </div>
                           
                          <button
                            onClick={() => removeRecipeIng(idx)}
                            className="p-3 text-slate-600 hover:text-rose-500"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              {!isSingle && (
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500">總成本</div>
                    <div className="text-xl font-mono text-rose-400 font-bold">
                      ${stats.cost}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">成本率</div>
                    <div
                      className={`text-xl font-mono font-bold ${
                        stats.costRate > 30
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {stats.costRate.toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">總液量</div>
                    <div className="text-xl font-mono text-blue-400 font-bold">
                      {stats.volume}ml
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase block">
                      售價 (雙向連動)
                    </label>
                    <input
                      type="number"
                      value={item.price || ''}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      placeholder={`建議: $${
                        Math.ceil(stats.cost / 0.3 / 10) * 10
                      }`}
                      className="w-full bg-slate-900 border border-slate-600 rounded p-1 text-sm text-amber-500 font-bold text-right outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}
              {!isSingle && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        調製法
                      </label>
                      <button
                        onClick={() => {
                          setAddingItem('technique');
                          setNewItemValue('');
                        }}
                        className="text-[10px] text-amber-500"
                      >
                        新增
                      </button>
                    </div>
                    {addingItem === 'technique' ? (
                      <div className="flex gap-2 h-[46px] items-center">
                        <input
                          autoFocus
                          value={newItemValue}
                          onChange={(e) => setNewItemValue(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                          placeholder="輸入調法..."
                        />
                        <button
                          onClick={handleAddItem}
                          className="bg-amber-600 text-white px-2 py-1 rounded text-xs font-bold shrink-0"
                        >
                          V
                        </button>
                        <button
                          onClick={() => setAddingItem(null)}
                          className="text-slate-400 p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <select
                        value={item.technique}
                        onChange={(e) =>
                          setItem({ ...item, technique: e.target.value })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-amber-500 appearance-none"
                      >
                        {availableTechniques.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        杯具
                      </label>
                      <button
                        onClick={() => {
                          setAddingItem('glass');
                          setNewItemValue('');
                        }}
                        className="text-[10px] text-amber-500"
                      >
                        新增
                      </button>
                    </div>
                    {addingItem === 'glass' ? (
                      <div className="flex gap-2 h-[46px] items-center">
                        <input
                          autoFocus
                          value={newItemValue}
                          onChange={(e) => setNewItemValue(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                          placeholder="輸入杯具..."
                        />
                        <button
                          onClick={handleAddItem}
                          className="bg-amber-600 text-white px-2 py-1 rounded text-xs font-bold shrink-0"
                        >
                          V
                        </button>
                        <button
                          onClick={() => setAddingItem(null)}
                          className="text-slate-400 p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <select
                        value={item.glass}
                        onChange={(e) =>
                          setItem({ ...item, glass: e.target.value })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-amber-500 appearance-none"
                      >
                        {availableGlasses.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      裝飾 (Garnish)
                    </label>
                    <input
                      value={item.garnish || ''}
                      onChange={(e) =>
                        setItem({ ...item, garnish: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-amber-500"
                      placeholder="e.g. Orange Peel"
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    風味標籤
                  </label>
                  <button
                    onClick={() => {
                      setAddingItem('tag');
                      setNewItemValue('');
                    }}
                    className="text-xs text-amber-500"
                  >
                    新增
                  </button>
                </div>
                {addingItem === 'tag' && (
                  <div className="flex gap-2 items-center mb-2 animate-slide-up">
                    <input
                      autoFocus
                      value={newItemValue}
                      onChange={(e) => setNewItemValue(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                      placeholder="輸入新標籤..."
                    />
                    <button
                      onClick={handleAddItem}
                      className="bg-amber-600 text-white px-2 py-1 rounded text-xs font-bold"
                    >
                      新增
                    </button>
                    <button
                      onClick={() => setAddingItem(null)}
                      className="text-slate-400 p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-all border ${
                        item.tags?.includes(tag)
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  步驟 / 備註
                </label>
                <textarea
                  value={item.steps}
                  onChange={(e) => setItem({ ...item, steps: e.target.value })}
                  className="w-full h-24 bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-amber-500 resize-none"
                  placeholder="輸入製作步驟..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  風味描述
                </label>
                <textarea
                  value={item.flavorDescription}
                  onChange={(e) =>
                    setItem({ ...item, flavorDescription: e.target.value })
                  }
                  className="w-full h-16 bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-amber-500 resize-none"
                  placeholder="簡短描述風味..."
                />
              </div>
            </div>
          )}
          <div className="pt-6 border-t border-slate-800">
            <button
              onClick={() => {
                if (requestDelete) requestDelete(item.id, mode);
                onClose();
              }}
              className="w-full py-3 rounded-xl border border-rose-900/50 text-rose-500 hover:bg-rose-900/20 font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={18} /> 刪除此項目
            </button>
          </div>
        </div>
      </div>

      <IngredientPickerModal
        isOpen={showIngPicker}
        onClose={() => setShowIngPicker(false)}
        onSelect={handlePickerSelect}
        ingredients={ingredients}
        categories={ingCategories}
        categorySubItems={categorySubItems} // 傳入子分類設定
        availableBases={availableBases}
      />
    </div>
  );
};

const ViewerOverlay = ({
  item,
  onClose,
  ingredients,
  startEdit,
  requestDelete,
  isConsumerMode,
}) => {
  if (!item) return null;
  const stats = calculateRecipeStats(item, ingredients);
  const isSingle = item.type === 'single' || item.isIngredient;
  const isFood = item.type === 'food';

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full md:w-[600px] bg-slate-950 h-full shadow-2xl flex flex-col animate-slide-up overflow-hidden">
        <div className="relative h-72 shrink-0">
          <AsyncImage
            imageId={item.image}
            alt={item.nameZh}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>

          <button
            onClick={onClose}
            className="absolute top-12 left-4 z-50 p-2 bg-black/30 backdrop-blur rounded-full text-white hover:bg-white/20 transition shadow-lg"
            style={{ marginTop: 'env(safe-area-inset-top)' }}
          >
            <ChevronLeft size={24} />
          </button>

          <div className="absolute bottom-0 left-0 p-6 w-full">
            <div className="flex gap-2 mb-2">
              {isFood && (
                <span className="text-[10px] text-emerald-200 bg-emerald-900/40 px-1.5 py-0.5 rounded border border-emerald-800/50">
                  {item.category || '餐點'}
                </span>
              )}
              {isSingle ? (
                <span className="text-[10px] text-purple-200 bg-purple-900/40 px-1.5 py-0.5 rounded border border-purple-800/50">
                  Single 單品
                </span>
              ) : (
                item.baseSpirit && (
                  <span className="text-[10px] text-blue-200 bg-blue-900/40 px-1.5 py-0.5 rounded border border-blue-800/50">
                    {item.baseSpirit}
                  </span>
                )
              )}
              {!isSingle && !isFood && (
                <span className="text-[10px] text-amber-200 bg-amber-900/40 px-1.5 py-0.5 rounded border border-amber-800/50">
                  {item.technique}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-serif font-bold text-white mb-1">
              {item.nameZh}
            </h1>
            <p className="text-slate-300 font-medium text-lg opacity-90">
              {item.nameEn}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950">
          <div className="p-6 space-y-8 pb-8">
            {!isSingle && (
              <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
                {!isFood && (
                  <div className="text-center">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                      酒精濃度
                    </div>
                    <div className="text-xl font-bold text-amber-500">
                      {stats.finalAbv.toFixed(1)}%
                    </div>
                  </div>
                )}
                {!isConsumerMode && !isFood && (
                  <>
                    <div className="w-px h-8 bg-slate-800"></div>
                    <div className="text-center">
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                        成本率
                      </div>
                      <div
                        className={`text-xl font-bold ${
                          stats.costRate > 30
                            ? 'text-rose-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {stats.costRate.toFixed(0)}%
                      </div>
                    </div>
                  </>
                )}
                {(isFood || !isConsumerMode) && (
                  <div className="w-px h-8 bg-slate-800"></div>
                )}
                <div className="text-center flex-1">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    售價
                  </div>
                  <div className="text-xl font-bold text-slate-200 font-mono">
                    ${item.price || stats.price}
                  </div>
                </div>
              </div>
            )}

            {isSingle && !isConsumerMode && <PricingTable recipe={item} />}

            {isSingle && isConsumerMode && (
              <div className="grid grid-cols-3 gap-2 w-full text-center bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
                {item.priceShot && (
                  <div className="p-2 border border-slate-700 rounded-lg">
                    <div className="text-[10px] text-slate-400">Shot</div>
                    <div className="text-amber-400 font-bold">
                      ${item.priceShot}
                    </div>
                  </div>
                )}
                {item.priceGlass && (
                  <div className="p-2 border border-amber-500/30 rounded-lg shadow-sm shadow-amber-500/10">
                    <div className="text-[10px] text-amber-500 font-bold">
                      Glass
                    </div>
                    <div className="text-amber-400 font-bold text-lg">
                      ${item.priceGlass}
                    </div>
                  </div>
                )}
                {item.priceBottle && (
                  <div className="p-2 border border-slate-700 rounded-lg">
                    <div className="text-[10px] text-slate-400">Bottle</div>
                    <div className="text-amber-400 font-bold">
                      ${item.priceBottle}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isSingle && !isFood && (
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Layers size={16} /> 材料
                </h3>
                <div className="space-y-3">
                  {item.ingredients.map((ingItem, idx) => {
                    const ing = ingredients.find((i) => i.id === ingItem.id);
                    return (
                      <div
                        key={idx}
                        className="flex justify-between items-center py-2 border-b border-slate-800/50"
                      >
                        <div className="flex-1">
                          <span className="text-slate-200 font-medium">
                            {ing?.nameZh || '未知材料'}
                          </span>
                          {!isConsumerMode && (
                            <span className="text-[10px] text-slate-500 font-mono ml-2">
                              ({ing?.abv || 0}%)
                            </span>
                          )}
                        </div>
                        {!isConsumerMode && (
                          <span className="text-amber-500 font-mono font-bold">
                            {ingItem.amount}ml
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {item.garnish && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                      <span className="text-slate-400 italic">
                        Garnish: {item.garnish}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isFood && (
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  {isConsumerMode ? (
                    <BookOpen size={16} />
                  ) : (
                    <ListPlus size={16} />
                  )}{' '}
                  {isConsumerMode ? '介紹' : '步驟/備註'}
                </h3>
                <div className="text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
                  {item.steps || '無描述'}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {item.flavorDescription && (
                <div className="bg-gradient-to-br from-amber-900/10 to-transparent p-4 rounded-xl border border-amber-500/10 relative">
                  <Quote
                    className="absolute top-2 left-2 text-amber-500/20"
                    size={24}
                  />
                  <p className="text-amber-200/80 italic text-center relative z-10 text-sm">
                    "{item.flavorDescription}"
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {item.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950 pb-safe z-20 flex gap-3 shrink-0">
          <button
            onClick={() =>
              window.open(
                `https://www.google.com/search?q=${encodeURIComponent(
                  (item.nameZh || '') +
                    ' ' +
                    (item.nameEn || '') +
                    ' ' +
                    (isFood ? '美食' : '調酒')
                )}`,
                '_blank'
              )
            }
            className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors flex items-center justify-center border border-slate-700"
            title="Google 搜尋"
          >
            <Globe size={20} />
          </button>
          {!isConsumerMode && (
            <button
              onClick={() =>
                startEdit(
                  item.isIngredient ? 'ingredient' : isFood ? 'food' : 'recipe',
                  item
                )
              }
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-amber-900/20 transition-all active:scale-95"
            >
              編輯{isFood ? '餐點' : '酒譜'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. Login Screen (修正：括號與權限顯示)
// ==========================================

const LoginScreen = ({ onLogin }) => {
  const [shopId, setShopId] = useState('');
  const [role, setRole] = useState(null); 
  const [password, setPassword] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false); // 新增

  useEffect(() => {
    if (role === 'staff' && shopId.length >= 3 && window.firebase) {
      const fetchStaff = async () => {
        setLoadingStaff(true);
        try {
          const db = window.firebase.firestore();
          const doc = await db
            .collection('shops')
            .doc(shopId)
            .collection('settings')
            .doc('config')
            .get();
          if (doc.exists && doc.data().staffList) {
            setStaffList(doc.data().staffList);
          } else {
            setStaffList([]);
          }
        } catch (e) {
          console.error('Fetch staff error', e);
        } finally {
          setLoadingStaff(false);
        }
      };
      const timer = setTimeout(fetchStaff, 1000);
      return () => clearTimeout(timer);
    }
  }, [shopId, role]);

  const handleLogin = async () => {
    if (!shopId) return setError('請輸入商店代碼');
    if (!role) return setError('請選擇身分');

    const db =
      window.firebase && window.firebase.firestore
        ? window.firebase.firestore()
        : null;

    if (role === 'owner') {
      const localPwd = localStorage.getItem('bar_admin_password');
      if (localPwd && password === localPwd) {
      } else if (db) {
        try {
          const settingsDoc = await db
            .collection('shops')
            .doc(shopId)
            .collection('settings')
            .doc('config')
            .get();
          if (settingsDoc.exists) {
            const cloudPwd = settingsDoc.data().adminPassword;
            if (cloudPwd && cloudPwd !== password)
              return setError('管理員密碼錯誤');
            if (!cloudPwd)
              await db
                .collection('shops')
                .doc(shopId)
                .collection('settings')
                .doc('config')
                .set({ adminPassword: password }, { merge: true });
            localStorage.setItem('bar_admin_password', password);
          } else {
            await db
              .collection('shops')
              .doc(shopId)
              .collection('settings')
              .doc('config')
              .set({ adminPassword: password });
            localStorage.setItem('bar_admin_password', password);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    let finalRole = role;
    if (role === 'staff') {
      if (staffList.length > 0) {
        if (!selectedStaffId) return setError('請選擇您的名字');
        const staff = staffList.find((s) => s.id === selectedStaffId);
        if (staff && staff.password !== password)
          return setError('員工密碼錯誤');

        if (staff && staff.role === 'manager') {
          finalRole = 'manager';
        }
      }
    }

    onLogin(shopId, finalRole);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 z-[100]">
      <div className="w-20 h-20 bg-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-600/30 mb-6 animate-scale-in">
        <Wine size={40} className="text-white" />
      </div>
      <h1 className="text-3xl font-serif text-white font-bold mb-2">
        Bar Manager
      </h1>
      <p className="text-slate-400 text-sm mb-8">
        雲端調酒管理系統 v14.3 (Pro)
      </p>

      <div className="w-full max-w-sm space-y-4">
        <div className="space-y-1">
          <label className="text-xs text-slate-500 font-bold uppercase">
            商店代碼 (Shop ID)
          </label>
          <div className="relative">
            <input
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 pl-12 text-white outline-none focus:border-amber-500 font-mono tracking-wide"
              placeholder="例如: demo_bar"
            />
            <LayoutDashboard
              className="absolute left-4 top-4 text-slate-500"
              size={20}
            />
          </div>
          {/* 修改：登入說明按鈕 (放大顯眼版) */}
          <div className="mt-3 mb-2">
             <button 
                onClick={() => setShowHelp(true)}
                className="w-full py-3 bg-amber-900/40 border border-amber-500 text-amber-400 rounded-xl text-base font-bold hover:bg-amber-900/60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20"
             >
                <HelpCircle size={20} />
                第一次使用？點此查看教學
             </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setRole('owner')}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              role === 'owner'
                ? 'bg-amber-600 border-amber-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <KeyRound size={24} />
            <span className="text-xs font-bold">店長</span>
          </button>
          <button
            onClick={() => {
              setRole('staff');
              setStaffList([]);
              setError('');
            }}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              role === 'staff'
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <Users size={24} />
            <span className="text-xs font-bold">員工</span>
          </button>
          <button
            onClick={() => setRole('customer')}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              role === 'customer'
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <Beer size={24} />
            <span className="text-xs font-bold">顧客</span>
          </button>
        </div>

        {role === 'owner' && (
          <div className="animate-fade-in">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-amber-500 text-center tracking-widest"
              placeholder="請輸入管理密碼"
            />
          </div>
        )}

        {role === 'staff' && (
          <div className="animate-fade-in space-y-3">
            {loadingStaff ? (
              <div className="text-center text-slate-500 text-xs">
                檢查員工名單中...
              </div>
            ) : staffList.length > 0 ? (
              <>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-bold uppercase">
                    選擇名字
                  </label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-blue-500 appearance-none"
                  >
                    <option value="">-- 請選擇 --</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-blue-500 text-center tracking-widest"
                  placeholder="輸入員工密碼"
                />
              </>
            ) : (
              <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-xl text-blue-200 text-xs text-center">
                此商店尚未設定員工名單
                <br />
                您可以直接登入
              </div>
            )}
          </div>
        )}

        {error && <p className="text-rose-500 text-xs text-center">{error}</p>}
        <button
          onClick={handleLogin}
          className="w-full py-4 bg-slate-100 text-slate-900 font-bold rounded-xl shadow-lg hover:bg-white transition-all active:scale-95 mt-4"
        >
          進入系統
        </button>
      </div>
      <LoginHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
};

// --- 6. Main App Container ---

function MainAppContent() {
  const [showPageIntro, setShowPageIntro] = useState(false); // ★ 修正：加入狀態控制
  const [activeTab, setActiveTab] = useState('recipes');
  const [firebaseReady, setFirebaseReady] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [shopId, setShopId] = useState('');
  const [userRole, setUserRole] = useState('customer');

  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [foodItems, setFoodItems] = useState([]); 
  const [sections, setSections] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [adminPassword, setAdminPassword] = useState(
    () => localStorage.getItem('bar_admin_password') || ''
  );
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false); // Help Modal

  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPwd, setNewStaffPwd] = useState('');
  const [isNewStaffManager, setIsNewStaffManager] = useState(false);

  // --- 新增：員工編輯邏輯開始 ---
  const [editingStaffId, setEditingStaffId] = useState(null);

  const startEditingStaff = (staff) => {
    setNewStaffName(staff.name);
    setNewStaffPwd(staff.password);
    setIsNewStaffManager(staff.role === 'manager');
    setEditingStaffId(staff.id);
  };

  const cancelEditingStaff = () => {
    setNewStaffName('');
    setNewStaffPwd('');
    setIsNewStaffManager(false);
    setEditingStaffId(null);
  };

  const handleUpdateStaff = async () => {
    if (!newStaffName.trim() || !newStaffPwd.trim())
      return showAlert('錯誤', '請輸入名字與密碼');

    const updatedList = staffList.map((s) => {
      if (s.id === editingStaffId) {
        return {
          ...s,
          name: newStaffName.trim(),
          password: newStaffPwd.trim(),
          role: isNewStaffManager ? 'manager' : 'staff',
        };
      }
      return s;
    });

    setStaffList(updatedList);
    
    if (window.firebase && shopId) {
      await window.firebase
        .firestore()
        .collection('shops')
        .doc(shopId)
        .collection('settings')
        .doc('config')
        .set({ staffList: updatedList }, { merge: true });
    }

    cancelEditingStaff(); 
    showAlert('成功', '員工資料已更新');
  };
  // --- 新增：員工編輯邏輯結束 ---

  const [editorMode, setEditorMode] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [recipeCategoryFilter, setRecipeCategoryFilter] = useState('all');

  const [availableTags, setAvailableTags] = useState([
    '酸甜 Sour/Sweet',
    '草本 Herbal',
    '果香 Fruity',
    '煙燻 Smoky',
    '辛辣 Spicy',
    '苦味 Bitter',
  ]);
  const [availableTechniques, setAvailableTechniques] = useState([
    'Shake',
    'Stir',
    'Build',
    'Roll',
    'Blend',
  ]);
  const [availableGlasses, setAvailableGlasses] = useState([
    'Martini',
    'Coupe',
    'Rock',
    'Highball',
    'Collins',
    'Shot',
  ]);

  const [availableBases, setAvailableBases] = useState(() => {
    try {
      const saved = localStorage.getItem('bar_custom_bases_v1');
      let list = saved ? JSON.parse(saved) : DEFAULT_BASE_SPIRITS;
      return list.filter((b) => !b.includes('Soft') && !b.includes('軟飲'));
    } catch (e) {
      return DEFAULT_BASE_SPIRITS;
    }
  });

  useEffect(() => {
    localStorage.setItem('bar_custom_bases_v1', JSON.stringify(availableBases));
  }, [availableBases]);
  
  // 新增：管理所有分類的子分類清單 (Map: CategoryID -> SubCategoryList[])
  const [categorySubItems, setCategorySubItems] = useState(() => {
      try {
          const saved = localStorage.getItem('bar_category_subitems_v1');
          if(saved) return JSON.parse(saved);
          
          return {
              alcohol: DEFAULT_BASE_SPIRITS,
              soft: ['Soda 蘇打', 'Juice 果汁', 'Syrup 糖漿', 'Tea 茶', 'Coffee 咖啡'],
              other: ['Spice 香料', 'Fruit 水果', 'Garnish 裝飾'],
          };
      } catch(e) {
          return { alcohol: DEFAULT_BASE_SPIRITS };
      }
  });
  
  useEffect(() => {
      localStorage.setItem('bar_category_subitems_v1', JSON.stringify(categorySubItems));
  }, [categorySubItems]);
  
  const handleAddSubCategory = (catId, subCatName) => {
      setCategorySubItems(prev => {
          const currentList = prev[catId] || [];
          if(currentList.includes(subCatName)) return prev;
          return {
              ...prev,
              [catId]: [...currentList, subCatName]
          };
      });
  };

  const [foodCategories, setFoodCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('bar_food_categories_v1');
      return saved
        ? JSON.parse(saved)
        : [
            { id: 'main', label: '主食' },
            { id: 'fried', label: '炸物' },
            { id: 'side', label: '下酒菜' },
          ];
    } catch (e) {
      return [
        { id: 'main', label: '主食' },
        { id: 'fried', label: '炸物' },
      ];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      'bar_food_categories_v1',
      JSON.stringify(foodCategories)
    );
  }, [foodCategories]);

  const [ingCategories, setIngCategories] = useState([
    { id: 'alcohol', label: '基酒 Alcohol' },
    { id: 'soft', label: '軟性飲料 Soft' },
    { id: 'other', label: '其他 Other' },
  ]);

  const [dialog, setDialog] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
  });

  useEffect(() => {
    // Check URL parameters for auto-login
    const params = new URLSearchParams(window.location.search);
    const urlShop = params.get('shop');
    const urlMode = params.get('mode');

    if (urlShop && urlMode === 'customer') {
      setShopId(urlShop);
      setUserRole('customer');
      setIsLoggedIn(true);
      localStorage.setItem('bar_shop_id', urlShop);
      localStorage.setItem('bar_user_role', 'customer'); 
    }

    const script = document.createElement('script');
    script.src =
      'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
    script.async = true;
    document.body.appendChild(script);

    loadFirebase()
      .then(() => {
        console.log('Firebase Loaded');
        setFirebaseReady(true);
      })
      .catch((err) => console.error('Firebase Error', err));

    const savedShop = localStorage.getItem('bar_shop_id');
    const savedRole = localStorage.getItem('bar_user_role');
     
    if (savedShop && savedRole && !urlShop) {
      setShopId(savedShop);
      setUserRole(savedRole);
      setIsLoggedIn(true);
    }

    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    // ★ 新增：檢查是否看過歡迎頁
    const hasSeenIntro = localStorage.getItem('bar_has_seen_intro_v1');
    if (!hasSeenIntro) {
      setTimeout(() => setShowPageIntro(true), 500);
    }
  }, []);

  // ★ 新增：關閉歡迎頁函式
  const handleCloseIntro = () => {
    localStorage.setItem('bar_has_seen_intro_v1', 'true');
    setShowPageIntro(false);
  };

  useEffect(() => {
    if (userRole === 'customer' && activeTab === 'tools') {
      setActiveTab('recipes');
    }
  }, [userRole, activeTab]);

  useEffect(() => {
    if (isLoggedIn && shopId && window.firebase && firebaseReady) {
      const db = window.firebase.firestore();
      const unsubIng = db
        .collection('shops')
        .doc(shopId)
        .collection('ingredients')
        .onSnapshot((snap) => {
          const list = snap.docs.map((d) => d.data());
          setIngredients(list);
          localStorage.setItem('bar_ingredients_v3', JSON.stringify(list));
        });
      const unsubRec = db
        .collection('shops')
        .doc(shopId)
        .collection('recipes')
        .onSnapshot((snap) => {
          const list = snap.docs.map((d) => d.data());
          setRecipes(list);
          localStorage.setItem('bar_recipes_v3', JSON.stringify(list));
        });
      const unsubFood = db
        .collection('shops')
        .doc(shopId)
        .collection('foods')
        .onSnapshot((snap) => {
          const list = snap.docs.map((d) => d.data());
          setFoodItems(list);
          localStorage.setItem('bar_foods_v1', JSON.stringify(list));
        });
      const unsubSec = db
        .collection('shops')
        .doc(shopId)
        .collection('sections')
        .onSnapshot((snap) => {
          const list = snap.docs.map((d) => d.data());
          setSections(list);
          localStorage.setItem('bar_sections_v3', JSON.stringify(list));
        });
      const unsubConfig = db
        .collection('shops')
        .doc(shopId)
        .collection('settings')
        .doc('config')
        .onSnapshot((doc) => {
          if (doc.exists) {
            const data = doc.data();
            if (data.staffList) setStaffList(data.staffList);
          }
        });
      return () => {
        unsubIng();
        unsubRec();
        unsubFood();
        unsubSec();
        unsubConfig();
      };
    } else {
      try {
        const i = localStorage.getItem('bar_ingredients_v3');
        if (i) setIngredients(JSON.parse(i));
        const r = localStorage.getItem('bar_recipes_v3');
        if (r) setRecipes(JSON.parse(r));
        const f = localStorage.getItem('bar_foods_v1');
        if (f) setFoodItems(JSON.parse(f));
        const s = localStorage.getItem('bar_sections_v3');
        if (s) setSections(JSON.parse(s));
      } catch (e) {}
    }
  }, [shopId, isLoggedIn, firebaseReady]);

  const handleLogin = (sid, role) => {
    setShopId(sid);
    setUserRole(role);
    setIsLoggedIn(true);
    localStorage.setItem('bar_shop_id', sid);
    localStorage.setItem('bar_user_role', role);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('bar_user_role');
    setShopId('');
    setIngredients([]);
    setRecipes([]);
    setFoodItems([]);
    setStaffList([]);
    if (window.history.pushState) {
        const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({path:newurl},'',newurl);
    }
  };

  const closeDialog = () => setDialog({ ...dialog, isOpen: false });
  const showConfirm = (title, message, onConfirm) =>
    setDialog({ isOpen: true, type: 'confirm', title, message, onConfirm });
  const showAlert = (title, message) =>
    setDialog({ isOpen: true, type: 'alert', title, message, onConfirm: null });

  const handleUnlockRequest = () => {
    setShowPasswordModal(true);
    setPasswordInput('');
  };

  // 修改後的解鎖邏輯
  const handleUnlockConfirm = () => {
    // 1. 檢查是否為「店長密碼」
    if (!adminPassword || passwordInput === adminPassword) {
      setUserRole('owner');
      setShowPasswordModal(false);
      return;
    }

    // 2. 檢查是否為「員工密碼」
    const staffMatch = staffList.find((s) => s.password === passwordInput);
    if (staffMatch) {
      setUserRole(staffMatch.role); // 變回該員工的身分
      setShowPasswordModal(false);
      return;
    }

    // 3. 緊急後門
    if (passwordInput === '9999') {
      alert('使用緊急密碼解鎖');
      setUserRole('owner');
      setShowPasswordModal(false);
      return;
    }

    alert('密碼錯誤！請輸入店長密碼或員工密碼');
  };

  const handleSetPassword = async () => {
    setAdminPassword(newPasswordInput);
    localStorage.setItem('bar_admin_password', newPasswordInput);
    if (window.firebase && shopId) {
      await window.firebase
        .firestore()
        .collection('shops')
        .doc(shopId)
        .collection('settings')
        .doc('config')
        .set({ adminPassword: newPasswordInput }, { merge: true });
    }
    setIsSettingPassword(false);
    setNewPasswordInput('');
    showAlert('成功', '管理員密碼已更新');
  };

  const handleAddStaff = async () => {
    if (!newStaffName.trim() || !newStaffPwd.trim())
      return showAlert('錯誤', '請輸入名字與密碼');
    const newStaff = {
      id: generateId(),
      name: newStaffName.trim(),
      password: newStaffPwd.trim(),
      role: isNewStaffManager ? 'manager' : 'staff',
    };
    const updatedList = [...staffList, newStaff];
    setStaffList(updatedList);
    setNewStaffName('');
    setNewStaffPwd('');
    setIsNewStaffManager(false);

    if (window.firebase && shopId) {
      await window.firebase
        .firestore()
        .collection('shops')
        .doc(shopId)
        .collection('settings')
        .doc('config')
        .set({ staffList: updatedList }, { merge: true });
    }
  };

  const handleRemoveStaff = async (id) => {
    const updatedList = staffList.filter((s) => s.id !== id);
    setStaffList(updatedList);
    if (window.firebase && shopId) {
      await window.firebase
        .firestore()
        .collection('shops')
        .doc(shopId)
        .collection('settings')
        .doc('config')
        .set({ staffList: updatedList }, { merge: true });
    }
  };

  const handleExportJSON = () => {
    const data = {
      ingredients,
      recipes,
      foodItems,
      sections,
      staffList,
      version: '14.2',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bar_manager_backup_${shopId}_${
      new Date().toISOString().split('T')[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (window.firebase && confirm('確定要還原備份嗎？')) {
          const db = window.firebase.firestore();
          const batch = db.batch();
          if (data.ingredients)
            data.ingredients.forEach((i) =>
              batch.set(
                db
                  .collection('shops')
                  .doc(shopId)
                  .collection('ingredients')
                  .doc(i.id),
                i
              )
            );
          if (data.recipes)
            data.recipes.forEach((r) =>
              batch.set(
                db
                  .collection('shops')
                  .doc(shopId)
                  .collection('recipes')
                  .doc(r.id),
                r
              )
            );
          if (data.foodItems)
            data.foodItems.forEach((f) =>
              batch.set(
                db
                  .collection('shops')
                  .doc(shopId)
                  .collection('foods')
                  .doc(f.id),
                f
              )
            );
          if (data.sections)
            data.sections.forEach((s) =>
              batch.set(
                db
                  .collection('shops')
                  .doc(shopId)
                  .collection('sections')
                  .doc(s.id),
                s
              )
            );
          if (data.staffList)
            batch.set(
              db
                .collection('shops')
                .doc(shopId)
                .collection('settings')
                .doc('config'),
              { staffList: data.staffList },
              { merge: true }
            );
          await batch.commit();
          showAlert('還原成功', '資料已從備份檔還原');
        }
      } catch (err) {
        showAlert('錯誤', '無效的備份檔案');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSystem = () => {
    if (
      prompt('警告：此操作將刪除所有資料。\n請輸入 "RESET" 確認：') === 'RESET'
    ) {
      if (window.firebase) {
        const db = window.firebase.firestore();
        ingredients.forEach((i) =>
          db
            .collection('shops')
            .doc(shopId)
            .collection('ingredients')
            .doc(i.id)
            .delete()
        );
        recipes.forEach((r) =>
          db
            .collection('shops')
            .doc(shopId)
            .collection('recipes')
            .doc(r.id)
            .delete()
        );
        foodItems.forEach((f) =>
          db
            .collection('shops')
            .doc(shopId)
            .collection('foods')
            .doc(f.id)
            .delete()
        );
        sections.forEach((s) =>
          db
            .collection('shops')
            .doc(shopId)
            .collection('sections')
            .doc(s.id)
            .delete()
        );
        db.collection('shops')
          .doc(shopId)
          .collection('settings')
          .doc('config')
          .delete();
        showAlert('重置完成', '系統資料已清空');
      }
    }
  };

  const handleExcelExport = () => {
    if (!window.XLSX) return alert('Excel 套件尚未載入');
    const wb = window.XLSX.utils.book_new();
    const ingData = ingredients.map((i) => ({
      ID: i.id,
      NameZh: i.nameZh,
      NameEn: i.nameEn,
      Type: i.type,
      SubType: i.subType,
      Price: i.price,
      Volume: i.volume,
      ABV: i.abv,
      AddToSingle: i.addToSingle ? 'Yes' : 'No',
    }));
    const wsIng = window.XLSX.utils.json_to_sheet(ingData);
    window.XLSX.utils.book_append_sheet(wb, wsIng, 'Ingredients');
    const recData = recipes.map((r) => ({
      ID: r.id,
      NameZh: r.nameZh,
      NameEn: r.nameEn,
      Type: r.type,
      Price: r.price,
      Base: r.baseSpirit,
    }));
    const wsRec = window.XLSX.utils.json_to_sheet(recData);
    window.XLSX.utils.book_append_sheet(wb, wsRec, 'Recipes');
    window.XLSX.writeFile(wb, `bar_data_${shopId}.xlsx`);
  };

  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!window.XLSX) return alert('Excel 套件尚未載入');
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = window.XLSX.read(data, { type: 'array' });
      if (window.firebase) {
        const db = window.firebase.firestore();
        const batch = db.batch();
        if (workbook.Sheets['Ingredients']) {
          const rawIngs = window.XLSX.utils.sheet_to_json(
            workbook.Sheets['Ingredients']
          );
          rawIngs.forEach((row) => {
            const item = {
              id: row.ID || generateId(),
              nameZh: row.NameZh,
              nameEn: row.NameEn || '',
              type: row.Type || 'other',
              subType: row.SubType || '',
              price: row.Price || 0,
              volume: row.Volume || 700,
              abv: row.ABV || 0,
              unit: 'ml',
              addToSingle: row.AddToSingle === 'Yes',
            };
            batch.set(
              db
                .collection('shops')
                .doc(shopId)
                .collection('ingredients')
                .doc(item.id),
              item
            );
          });
        }
        if (workbook.Sheets['Recipes']) {
          const rawRecs = window.XLSX.utils.sheet_to_json(
            workbook.Sheets['Recipes']
          );
          rawRecs.forEach((row) => {
            const item = {
              id: row.ID || generateId(),
              nameZh: row.NameZh,
              nameEn: row.NameEn || '',
              type: row.Type || 'classic',
              price: row.Price || 0,
              baseSpirit: row.Base || '',
              ingredients: [],
              tags: [],
            };
            batch.set(
              db
                .collection('shops')
                .doc(shopId)
                .collection('recipes')
                .doc(item.id),
              item
            );
          });
        }
        await batch.commit();
        showAlert('成功', 'Excel 資料已匯入雲端');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBatchAddIngredients = async (newItems) => {
    if (window.firebase) {
      const db = window.firebase.firestore();
      const batch = db.batch();
      newItems.forEach((item) => {
        const ref = db
          .collection('shops')
          .doc(shopId)
          .collection('ingredients')
          .doc(item.id);
        batch.set(ref, item);
      });
      await batch.commit();
      showAlert('同步成功', `已上傳 ${newItems.length} 項材料`);
    }
  };

  const requestDelete = async (id, type) => {
    if (userRole !== 'owner' && userRole !== 'manager') return;

    if (type === 'ingredient') {
      const usedInRecipes = recipes.filter(r => 
        r.ingredients && r.ingredients.some(ing => ing.id === id)
      );

      if (usedInRecipes.length > 0) {
        const recipeNames = usedInRecipes.map(r => r.nameZh).join(', ');
        showAlert(
          '無法刪除', 
          `此材料正在被以下酒譜使用中：\n${recipeNames}\n\n請先從酒譜中移除此材料。`
        );
        return; 
      }
    }

    showConfirm('刪除確認', '確定要刪除嗎？', async () => {
      if (window.firebase) {
        const db = window.firebase.firestore();
        const collectionName =
          type === 'recipe'
            ? 'recipes'
            : type === 'food'
            ? 'foods'
            : 'ingredients';
        await db
          .collection('shops')
          .doc(shopId)
          .collection(collectionName)
          .doc(id)
          .delete();
      }
      setEditorMode(null);
      setViewingItem(null);
    });
  };

  const saveItem = async (item, mode) => {
    const db = window.firebase.firestore();
    const col =
      mode === 'recipe' ? 'recipes' : mode === 'food' ? 'foods' : 'ingredients';
    if (item.image && item.image.startsWith('data:')) {
      item.image = await compressImage(item.image);
      await ImageDB.save(item.id, item.image);
    }
    await db
      .collection('shops')
      .doc(shopId)
      .collection(col)
      .doc(item.id)
      .set(item);
    setEditorMode(null);
  };

  const startEdit = (mode, item) => {
    setEditorMode(mode);
    if (item) {
      setEditingItem(item);
    } else {
      const newItem = { id: generateId(), nameZh: '' };
      if (mode === 'recipe') {
        Object.assign(newItem, {
          ingredients: [],
          type: 'classic',
          targetCostRate: '',
          price: '', 
        });
      } else if (mode === 'food') {
        Object.assign(newItem, {
          type: 'food',
          price: '',
          flavorDescription: '',
          image: '',
          category: '',
        });
      } else {
        Object.assign(newItem, {
          type: 'alcohol',
          price: 0,
          volume: 700,
          subType: '',
        });
      }
      setEditingItem(newItem);
    }
  };

  if (!isLoggedIn) return <LoginScreen onLogin={handleLogin} />;

  const isOwner = userRole === 'owner';
  const isManager = userRole === 'manager';
  const isStaff = userRole === 'staff';

  const canEdit = isOwner || isManager;
  const showInventory = canEdit || isStaff;
  const showQuickCalc = canEdit || isStaff;

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-200 font-sans flex flex-col w-full">
      <style>{`:root{color-scheme:dark}.pt-safe{padding-top:env(safe-area-inset-top)}.pb-safe{padding-bottom:env(safe-area-inset-bottom)}.custom-scrollbar::-webkit-scrollbar{width:4px;background:#1e293b}.custom-scrollbar::-webkit-scrollbar-thumb{background:#475569;border-radius:2px}`}</style>

      <main className="flex-1 relative overflow-hidden w-full">
        {activeTab === 'recipes' && (
          <RecipeListScreen
            recipes={recipes}
            ingredients={ingredients}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            recipeCategoryFilter={recipeCategoryFilter}
            setRecipeCategoryFilter={setRecipeCategoryFilter}
            startEdit={startEdit}
            setViewingItem={setViewingItem}
            availableTags={availableTags}
            availableBases={availableBases}
            categorySubItems={categorySubItems}
            userRole={canEdit ? 'owner' : 'customer'}
            isConsumerMode={!canEdit}
            onUnlock={handleUnlockRequest}
            ingCategories={ingCategories}
          />
        )}

        {activeTab === 'food' && (
          <FoodListScreen
            foodItems={foodItems}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            startEdit={startEdit}
            setViewingItem={setViewingItem}
            userRole={canEdit ? 'owner' : 'customer'}
            onUnlock={handleUnlockRequest}
            foodCategories={foodCategories}
            setFoodCategories={setFoodCategories}
          />
        )}

        {activeTab === 'featured' && (
          <FeaturedSectionScreen
            sections={sections}
            setSections={setSections}
            recipes={recipes}
            setViewingItem={setViewingItem}
            ingredients={ingredients}
            showConfirm={showConfirm}
            userRole={canEdit ? 'owner' : 'customer'}
            isConsumerMode={!canEdit}
            onUnlock={handleUnlockRequest}
          />
        )}

        {activeTab === 'ingredients' && showInventory && (
          <InventoryScreen
            ingredients={ingredients}
            startEdit={startEdit}
            requestDelete={requestDelete}
            ingCategories={ingCategories}
            setIngCategories={setIngCategories}
            showConfirm={showConfirm}
            onBatchAdd={handleBatchAddIngredients}
            availableBases={availableBases}
            categorySubItems={categorySubItems}
            onAddSubCategory={handleAddSubCategory}
            isReadOnly={isStaff}
          />
        )}

        {activeTab === 'quick' && showQuickCalc && (
          <QuickCalcScreen
            ingredients={ingredients}
            availableBases={availableBases}
            onCreateRecipe={(draftItem) => startEdit('recipe', draftItem)}
          />
        )}

        {activeTab === 'tools' && (
          <div className="h-full flex flex-col overflow-y-auto p-6 space-y-6 pt-20 custom-scrollbar pb-32">
            <div className="text-center">
              <h2 className="text-xl font-serif text-white">
                Bar Manager Cloud
              </h2>
              <p className="text-xs text-slate-500">
                Shop ID: {shopId} /{' '}
                {userRole === 'manager'
                  ? '資深員工'
                  : userRole === 'owner'
                  ? '店長'
                  : '員工'}
              </p>
            </div>

             <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <button
                  onClick={() => setShowHelpModal(true)}
                  className="w-full flex items-center justify-between text-white font-bold"
                >
                   <span className="flex items-center gap-2"><HelpCircle size={20} className="text-amber-500"/> 使用教學 / FAQ</span>
                   <ChevronLeft size={16} className="rotate-180 text-slate-500"/>
                </button>
             </div>

            {isOwner && (
              <div className="bg-slate-900 p-4 rounded-xl space-y-4 border border-slate-800">
                <h3 className="text-sm font-bold text-white flex gap-2 items-center">
                  <QrCode size={16} /> 顧客專屬 QR Code
                </h3>
                <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center">
                   <img
                     src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                       window.location.origin + window.location.pathname + '?shop=' + shopId + '&mode=customer'
                     )}`}
                     alt="Customer QR"
                     className="w-48 h-48"
                   />
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-2">掃描此 QR Code 可直接進入顧客模式</p>
                  <button
                     onClick={() => {
                       const url = window.location.origin + window.location.pathname + '?shop=' + shopId + '&mode=customer';
                       navigator.clipboard.writeText(url);
                       alert('連結已複製');
                     }}
                     className="text-amber-500 text-xs underline"
                  >
                   複製連結
                  </button>
                </div>
              </div>
            )}

            {isOwner && (
              <div className="bg-slate-900 p-4 rounded-xl space-y-4 border border-slate-800">
                <h3 className="text-sm font-bold text-white flex gap-2 items-center">
                  <KeyRound size={16} /> 管理員密碼
                </h3>
                {isSettingPassword ? (
                  <div className="flex gap-2">
                    <input
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      className="bg-slate-800 border border-slate-600 rounded px-2 py-1 flex-1 text-sm"
                    />
                    <button
                      onClick={handleSetPassword}
                      className="bg-amber-600 text-white px-3 rounded text-xs"
                    >
                      儲存
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSettingPassword(true)}
                    className="text-xs text-amber-500"
                  >
                    修改密碼
                  </button>
                )}
              </div>
            )}

            {isOwner && (
              <div className="bg-slate-900 p-4 rounded-xl space-y-4 border border-slate-800 animate-slide-up">
                <h3 className="text-sm font-bold text-white flex gap-2 items-center">
                  <Users size={16} /> 店員管理
                </h3>
                <div className="space-y-2">
                  {staffList.map((staff) => (
                    <div
                      key={staff.id}
                      className={`flex justify-between items-center p-3 rounded-lg border transition-colors ${
                        editingStaffId === staff.id
                          ? 'bg-amber-900/20 border-amber-500/50'
                          : 'bg-slate-800 border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
                          {staff.name}
                          {staff.role === 'manager' && (
                            <span className="text-[10px] bg-amber-900 text-amber-100 px-1 rounded">
                              資深
                            </span>
                          )}
                          {editingStaffId === staff.id && (
                            <span className="text-[10px] text-amber-500 font-bold animate-pulse">
                              (編輯中...)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          密碼: {staff.password}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditingStaff(staff)}
                          className="text-slate-400 p-2 hover:text-white hover:bg-slate-700 rounded-full"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleRemoveStaff(staff.id)}
                          className="text-rose-500 p-2 hover:bg-rose-900/20 rounded-full"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {staffList.length === 0 && (
                    <div className="text-xs text-slate-500 text-center py-2">
                      尚未新增店員
                    </div>
                  )}
                </div>
                
                {/* 輸入區塊 */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex gap-2">
                    <input
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      placeholder="名字"
                      className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
                    />
                    <input
                      value={newStaffPwd}
                      onChange={(e) => setNewStaffPwd(e.target.value)}
                      placeholder="密碼"
                      className="w-24 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isNewStaffManager}
                        onChange={(e) => setIsNewStaffManager(e.target.checked)}
                        className="accent-amber-600 w-4 h-4 rounded"
                      />
                      設為資深員工 (可編輯)
                    </label>
                    
                    {editingStaffId ? (
                      <div className="flex gap-2">
                        <button
                          onClick={cancelEditingStaff}
                          className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded font-bold text-sm"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleUpdateStaff}
                          className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded font-bold text-sm shadow-lg shadow-amber-900/20"
                        >
                          儲存修改
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleAddStaff}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded font-bold text-sm shadow-lg shadow-blue-900/20"
                      >
                        新增
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isOwner && (
              <div className="bg-slate-900 p-4 rounded-xl space-y-4 border border-slate-800">
                <h3 className="text-sm font-bold text-white flex gap-2 items-center">
                  <Database size={16} /> 資料庫管理
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleExportJSON}
                    className="flex flex-col items-center justify-center p-3 bg-slate-800 rounded-xl border border-slate-700 hover:bg-slate-700 text-slate-300"
                  >
                    <Download size={20} className="mb-1 text-amber-500" />
                    <span className="text-xs">備份 (JSON)</span>
                  </button>
                  <label className="flex flex-col items-center justify-center p-3 bg-slate-800 rounded-xl border border-slate-700 hover:bg-slate-700 text-slate-300 cursor-pointer">
                    <Upload size={20} className="mb-1 text-blue-500" />
                    <span className="text-xs">還原 (JSON)</span>
                    <input
                      type="file"
                      hidden
                      accept=".json"
                      onChange={handleImportJSON}
                    />
                  </label>
                  <button
                    onClick={handleExcelExport}
                    className="flex flex-col items-center justify-center p-3 bg-slate-800 rounded-xl border border-slate-700 hover:bg-slate-700 text-slate-300"
                  >
                    <FileSpreadsheet
                      size={20}
                      className="mb-1 text-emerald-500"
                    />
                    <span className="text-xs">匯出 Excel</span>
                  </button>
                  <label className="flex flex-col items-center justify-center p-3 bg-slate-800 rounded-xl border border-slate-700 hover:bg-slate-700 text-slate-300 cursor-pointer">
                    <FilePlus size={20} className="mb-1 text-emerald-500" />
                    <span className="text-xs">匯入 Excel</span>
                    <input
                      type="file"
                      hidden
                      accept=".xlsx"
                      onChange={handleExcelImport}
                    />
                  </label>
                </div>
                <button
                  onClick={handleResetSystem}
                  className="w-full py-3 border border-rose-900/50 text-rose-500 rounded-xl hover:bg-rose-900/20 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <RefreshCcw size={14} /> 重置系統 (危險)
                </button>
              </div>
            )}

            {canEdit && (
              <div className="bg-slate-900 p-4 rounded-xl space-y-4 border border-slate-800">
                <h3 className="text-sm font-bold text-white flex gap-2 items-center">
                  <Users size={16} /> 訪客模式
                </h3>
                <button
                  onClick={() => setUserRole('customer')}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Lock size={16} /> 鎖定為顧客模式
                </button>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <LogOut size={18} /> 登出 / 切換商店
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Overlays */}
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
      <PageIntroModal isOpen={showPageIntro} onClose={handleCloseIntro} />

      {showPasswordModal && (
        <div className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xs rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              管理員解鎖
            </h3>
            <input
              type="password"
              autoFocus
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-center text-white mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl"
              >
                取消
              </button>
              <button
                onClick={handleUnlockConfirm}
                className="flex-1 py-3 bg-amber-600 text-white rounded-xl"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}

      {dialog.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xs rounded-2xl p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              {dialog.title}
            </h3>
            <p className="text-slate-400 text-sm mb-4">{dialog.message}</p>
            <div className="flex gap-2">
              {dialog.type === 'confirm' && (
                <button
                  onClick={closeDialog}
                  className="flex-1 py-3 bg-slate-800 rounded-xl text-slate-400"
                >
                  取消
                </button>
              )}
              <button
                onClick={() => {
                  if (dialog.onConfirm) dialog.onConfirm();
                  closeDialog();
                }}
                className="flex-1 py-3 bg-amber-600 rounded-xl text-white"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="shrink-0 bg-slate-950 border-t border-slate-800 pb-safe pt-2 z-30 w-full flex justify-around items-center">
        {[
          { id: 'recipes', icon: Beer, l: '酒單' },
          { id: 'food', icon: Utensils, l: '餐點' },
          { id: 'featured', icon: Star, l: '專區' },
          showInventory && { id: 'ingredients', icon: GlassWater, l: '材料' },
          showQuickCalc && { id: 'quick', icon: Calculator, l: '速算' },
          userRole !== 'customer' && { id: 'tools', icon: Settings, l: '設定' },
        ]
          .filter(Boolean)
          .map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex flex-col items-center gap-1 ${
                activeTab === t.id ? 'text-amber-500' : 'text-slate-500'
              }`}
            >
              <t.icon size={22} />
              <span className="text-[10px] font-bold">{t.l}</span>
            </button>
          ))}
      </nav>

      <EditorSheet
        mode={editorMode}
        item={editingItem}
        setItem={setEditingItem}
        onSave={() => saveItem(editingItem, editorMode)}
        onClose={() => setEditorMode(null)}
        ingredients={ingredients}
        availableTechniques={availableTechniques}
        setAvailableTechniques={setAvailableTechniques}
        availableTags={availableTags}
        setAvailableTags={setAvailableTags}
        availableGlasses={availableGlasses}
        setAvailableGlasses={setAvailableGlasses}
        availableBases={availableBases}
        categorySubItems={categorySubItems}
        onAddSubCategory={handleAddSubCategory}
        setAvailableBases={setAvailableBases}
        requestDelete={requestDelete}
        ingCategories={ingCategories}
        setIngCategories={setIngCategories}
        showAlert={showAlert}
        foodCategories={foodCategories}
        setFoodCategories={setFoodCategories}
      />
      <ViewerOverlay
        item={viewingItem}
        onClose={() => setViewingItem(null)}
        ingredients={ingredients}
        startEdit={(m, i) => startEdit(m, i)}
        isConsumerMode={!canEdit}
      />
    </div>
  );
}

const App = () => (
  <ErrorBoundary>
    <MainAppContent />
  </ErrorBoundary>
);

export default App;