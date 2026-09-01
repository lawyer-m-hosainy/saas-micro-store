import React, { useState, useCallback, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { 
  MapPin, 
  Search, 
  Store, 
  Sparkles, 
  Send, 
  Mail, 
  Copy, 
  Check, 
  ExternalLink,
  MessageCircle, 
  PhoneCall, 
  Globe, 
  X,
  RefreshCw,
  Radar,
  Radio,
  Download,
  Users,
  Zap,
  CheckCircle2,
  ListOrdered
} from 'lucide-react';

const API_KEY = ((import.meta as unknown) as { env?: Record<string, string> })?.env?.VITE_GOOGLE_MAPS_API_KEY || '';

interface OutreachData {
  recommendedTool: string;
  pitchReason: string;
  whatsappMessage: string;
  emailSubject: string;
  emailBody: string;
}

interface BatchItem {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  type?: string;
  recommendedTool?: string;
  whatsappMessage?: string;
  sent?: boolean;
}

export function LocalSellers() {
  if (!API_KEY) {
    return (
      <div className="flex-1 p-8 text-center" dir="rtl">
        <div className="bg-yellow-50 text-yellow-800 p-8 rounded-2xl max-w-xl mx-auto shadow-sm border border-yellow-100 mt-10">
          <MapPin size={48} className="mx-auto mb-4 text-yellow-500" />
          <h2 className="text-xl font-bold mb-3">مطلوب مفتاح خرائط جوجل</h2>
          <p className="mb-6 text-yellow-700 leading-relaxed">
            للبحث عن المتاجر والشركاء المحليين على الخريطة والتواصل معهم، يجب إضافة مفتاح <code>VITE_GOOGLE_MAPS_API_KEY</code> في إعدادات البيئة (Settings {'>'} Secrets).
          </p>
          <a 
            href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio" 
            target="_blank" 
            rel="noreferrer" 
            className="inline-block bg-white text-yellow-800 px-6 py-2.5 rounded-lg font-bold shadow-sm hover:bg-yellow-100 transition-colors"
          >
            احصل على مفتاح تجريبي مجاني من هنا
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 relative animate-in fade-in duration-300" dir="rtl">
      <div className="p-6 bg-white border-b border-gray-200 z-10 relative shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Radio className="text-indigo-600 animate-pulse" />
            رادار التسويق الآلي للأنشطة المحلية (نطاق 5 كم)
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            مسح تلقائي للمحلات والشركات في محيط 5 كم، وصياغة حملة رسائل واتساب تسويقية مخصصة بالذكاء الاصطناعي وإرسالها فوراً.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full w-fit">
          <Sparkles size={14} />
          مدعوم بنموذج Gemini 3.7
        </div>
      </div>
      
      <div className="flex-1 relative w-full">
        <APIProvider apiKey={API_KEY} version="weekly">
          <MapManager />
        </APIProvider>
      </div>
    </div>
  );
}

function MapManager() {
  const [places, setPlaces] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('مطاعم، كافيهات، شركات، متاجر');
  const [isSearching, setIsSearching] = useState(false);
  
  // Single Outreach state
  const [outreachData, setOutreachData] = useState<OutreachData | null>(null);
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email'>('whatsapp');

  // 5km Automated Radar Campaign State
  const [showRadarModal, setShowRadarModal] = useState(false);
  const [isScanningRadar, setIsScanningRadar] = useState(false);
  const [radarBatchList, setRadarBatchList] = useState<BatchItem[]>([]);
  const [currentSendIndex, setCurrentSendIndex] = useState<number>(0);
  
  const map = useMap();
  const placesLib = useMapsLibrary('places');

  const handleSearch = useCallback(async () => {
    if (!placesLib || !map || !searchQuery.trim()) return;
    
    setIsSearching(true);
    const { Place } = placesLib;
    const center = map.getCenter();
    
    if (!center) {
        setIsSearching(false);
        return;
    }

    try {
      const request = {
        textQuery: searchQuery,
        locationBias: center,
        maxResultCount: 20,
      };
      
      //@ts-ignore - searchByText on Place class
      const { places } = await Place.searchByText(request);
      setPlaces(places || []);
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء البحث. تأكد من تفعيل "Places API (New)" في مشروعك.');
    } finally {
      setIsSearching(false);
    }
  }, [placesLib, map, searchQuery]);

  // Request location on load
  useEffect(() => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.setCenter(pos);
          map.setZoom(13); // Zoom level appropriate for ~5km view
          
          setTimeout(() => handleSearch(), 500);
        },
        () => {
          handleSearch();
        }
      );
    }
  }, [map, handleSearch]);

  // 📡 Launch 5km Autonomous Radar Scan
  const launch5kmRadarScan = async () => {
    if (!placesLib || !map) return;
    setShowRadarModal(true);
    setIsScanningRadar(true);
    setRadarBatchList([]);

    const { Place } = placesLib;
    const center = map.getCenter();
    if (!center) {
      setIsScanningRadar(false);
      return;
    }

    try {
      // 1. Search places in radius
      const request = {
        textQuery: 'متاجر، مطاعم، شركات، عيادات، خدمات',
        locationBias: center,
        maxResultCount: 15,
      };

      //@ts-ignore
      const { places: scanned } = await Place.searchByText(request);
      const items: any[] = scanned || [];

      // Extract basic info
      const rawBatch = items.map((p, idx) => ({
        id: p.id || `place-${idx}`,
        name: p.displayName || `متجر محلي #${idx + 1}`,
        type: p.primaryType || 'نشاط تجاري محلي',
        address: p.formattedAddress || 'نطاق 5 كم',
        phone: p.nationalPhoneNumber || ''
      }));

      // 2. Call Batch AI to craft custom pitch messages for each in 1 request
      const res = await fetch('/api/generate-batch-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ places: rawBatch })
      });

      if (res.ok) {
        const { results } = await res.json();
        const combined: BatchItem[] = rawBatch.map((item, idx) => {
          const aiItem = results[idx] || {};
          return {
            ...item,
            recommendedTool: aiItem.recommendedTool || 'أداة أتمتة المبيعات والخدمات',
            whatsappMessage: aiItem.whatsappMessage || `مرحباً فريق ${item.name} 👋 لدينا حلول برمجية ذكية لمضاعفة مبيعاتكم وأتمتة خدمة عملائكم. هل تودون تجربة نسخة مجانية؟`,
            sent: false
          };
        });
        setRadarBatchList(combined);
      } else {
        // Fallback if backend batch errors
        setRadarBatchList(rawBatch.map(item => ({
          ...item,
          recommendedTool: 'مساعد خدمة العملاء الذكي وتوليد المبيعات',
          whatsappMessage: `مرحباً فريق ${item.name} 👋 يسعدنا تقديم برمجيات ذكية مخصصة لنشاطكم لمضاعفة المبيعات وأتمتة الردود.`,
          sent: false
        })));
      }
    } catch (e) {
      console.error("Radar scan error:", e);
    } finally {
      setIsScanningRadar(false);
    }
  };

  const generateOutreach = async (place: any) => {
    setIsGeneratingPitch(true);
    setOutreachData(null);
    try {
      if (place.fetchFields) {
        try {
          await place.fetchFields({
            fields: ['displayName', 'formattedAddress', 'primaryType', 'nationalPhoneNumber', 'websiteUri']
          });
        } catch (err) {
          console.log('fetchFields not supported or failed', err);
        }
      }

      const res = await fetch('/api/generate-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeName: place.displayName || 'نشاط تجاري',
          placeType: place.primaryType || searchQuery,
          placeAddress: place.formattedAddress || ''
        })
      });

      if (res.ok) {
        const data = await res.json();
        setOutreachData(data);
      }
    } catch (error) {
      console.error('Failed to generate outreach:', error);
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const handleSelectPlace = (place: any) => {
    setSelectedPlace(place);
    generateOutreach(place);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const openWhatsApp = (message: string, phone?: string, markIndex?: number) => {
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    const encodedMsg = encodeURIComponent(message);
    const url = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodedMsg}`
      : `https://wa.me/?text=${encodedMsg}`;
    window.open(url, '_blank');

    if (typeof markIndex === 'number') {
      setRadarBatchList(prev => prev.map((item, idx) => idx === markIndex ? { ...item, sent: true } : item));
    }
  };

  const openMailClient = (subject: string, body: string) => {
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
  };

  const exportCampaignCSV = () => {
    if (radarBatchList.length === 0) return;
    const header = "اسم النشاط,نوع النشاط,الهاتف,الأداة المقترحة,رسالة الواتساب\n";
    const rows = radarBatchList.map(item => (
      `"${item.name}","${item.type || ''}","${item.phone || ''}","${item.recommendedTool || ''}","${(item.whatsappMessage || '').replace(/\n/g, ' ')}"`
    )).join('\n');

    const blob = new Blob(["\uFEFF" + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `5km-outreach-campaign-${Date.now()}.csv`;
    link.click();
  };

  return (
    <>
      {/* Search & Radar Action Bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4 flex flex-col sm:flex-row gap-3 items-center" dir="rtl">
        
        {/* Search input */}
        <div className="bg-white p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 flex gap-2 items-center flex-1 w-full">
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="ابحث عن: كافيهات، مستشفيات، شركات شحن، متاجر ملابس..."
            className="flex-1 px-4 py-2 outline-none text-gray-700 bg-transparent text-xs sm:text-sm"
          />
          <button 
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1.5 disabled:opacity-75 text-xs shadow-sm whitespace-nowrap"
          >
            <Search size={15} />
            {isSearching ? 'بحث...' : 'بحث عادي'}
          </button>
        </div>

        {/* 📡 5KM Radar Launcher Button */}
        <button
          onClick={launch5kmRadarScan}
          className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg border border-emerald-400/30 whitespace-nowrap transition-transform hover:scale-105 active:scale-95"
        >
          <Radio size={16} className="animate-pulse text-emerald-200" />
          <span>مسح راداري 5 كم وإرسال آلي</span>
        </button>
      </div>

      {/* Quick filters */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 flex gap-2 overflow-x-auto max-w-full px-4 py-1">
        {['مطاعم وكافيهات', 'عيادات ومراكز طبية', 'شركات عقارات', 'متاجر تجزئة', 'وكالات تسويق'].map((tag) => (
          <button
            key={tag}
            onClick={() => {
              setSearchQuery(tag);
              setTimeout(() => handleSearch(), 100);
            }}
            className="bg-white/95 backdrop-blur text-xs text-gray-700 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm hover:bg-indigo-50 hover:text-indigo-600 transition-colors whitespace-nowrap"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Map View */}
      <Map
        defaultCenter={{lat: 24.7136, lng: 46.6753}}
        defaultZoom={13}
        mapId="DEMO_MAP_ID"
        disableDefaultUI={true}
        gestureHandling={'greedy'}
      >
        {places.map((place) => (
          place.location && (
            <AdvancedMarker
              key={place.id}
              position={place.location}
              onClick={() => handleSelectPlace(place)}
            >
              <div className={`p-2.5 rounded-full flex items-center justify-center shadow-lg border-2 border-white cursor-pointer transition-all ${selectedPlace?.id === place.id ? 'bg-indigo-900 scale-125 ring-4 ring-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                <Store size={18} className="text-white" />
              </div>
            </AdvancedMarker>
          )
        ))}
      </Map>

      {/* 📡 5KM Radar Bulk Outreach Modal */}
      {showRadarModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in" dir="rtl">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl border border-gray-100 relative max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Radio size={12} className="animate-pulse" />
                    حملة الرادار الجغرافي (5 كم)
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">المسح والتواصل الآلي مع محلات النطاق</h3>
              </div>
              <button 
                onClick={() => setShowRadarModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {isScanningRadar ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 animate-spin">
                    <RefreshCw size={32} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">جاري مسح محيط 5 كيلومتر مربع...</h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      يقوم الذكاء الاصطناعي بحصر جميع الأنشطة التجارية وتخصيص رسالة دعائية باسم كل متجر وأداته المناسبة.
                    </p>
                  </div>
                </div>
              ) : radarBatchList.length > 0 ? (
                <>
                  {/* Stats Bar */}
                  <div className="bg-gradient-to-l from-indigo-50 to-emerald-50 border border-indigo-100 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-600">تم اكتشاف وتجهيز:</span>
                      <div className="text-lg font-black text-gray-900">{radarBatchList.length} نشاط تجاري في نطاقك</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={exportCampaignCSV}
                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Download size={14} />
                        تصدير كملف Excel/CSV
                      </button>
                    </div>
                  </div>

                  {/* List of Detected Stores with Instant WhatsApp Push */}
                  <div className="space-y-3">
                    {radarBatchList.map((item, idx) => (
                      <div 
                        key={item.id} 
                        className={`p-4 rounded-2xl border transition-all ${item.sent ? 'bg-emerald-50/40 border-emerald-200' : 'bg-gray-50/70 border-gray-200 hover:border-indigo-300'}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                              <span className="text-[11px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                                {item.type}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">{item.address}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openWhatsApp(item.whatsappMessage || '', item.phone, idx)}
                              className={`text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs ${
                                item.sent 
                                  ? 'bg-emerald-700 text-white' 
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              <Send size={13} />
                              {item.sent ? 'تم الإرسال ✓' : 'إرسال واتساب'}
                            </button>
                          </div>
                        </div>

                        {/* Custom Pitch Box */}
                        <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs space-y-1.5">
                          <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-[11px]">
                            <Sparkles size={13} />
                            الأداة المقترحة: {item.recommendedTool}
                          </div>
                          <p className="text-gray-700 whitespace-pre-line text-[11px] leading-relaxed">
                            {item.whatsappMessage}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-gray-500 text-sm">
                  لم يتم العثور على أنشطة في هذا النطاق، حاول تحريك الخريطة وإعادة المسح.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>نظام الأتمتة المباشرة لسوق ساس</span>
              <button
                onClick={() => launch5kmRadarScan()}
                className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
              >
                <RefreshCw size={14} />
                إعادة المسح الآن
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Single Outreach Drawer / Dialog */}
      {selectedPlace && (
        <div className="absolute bottom-6 right-6 z-20 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-5 bg-gradient-to-l from-indigo-700 to-indigo-600 text-white relative">
            <button 
              onClick={() => setSelectedPlace(null)}
              className="absolute top-4 left-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-medium">نشاط محلي محدد</span>
            </div>
            <h3 className="font-bold text-xl leading-tight mb-1 text-white">{selectedPlace.displayName || 'نشاط تجاري'}</h3>
            <p className="text-xs text-indigo-100 flex items-center gap-1 opacity-90 truncate">
              <MapPin size={12} />
              {selectedPlace.formattedAddress || 'العنوان غير محدد'}
            </p>
          </div>

          <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
            {isGeneratingPitch ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin text-indigo-600 mb-3">
                  <RefreshCw size={28} />
                </div>
                <h4 className="font-bold text-gray-800 text-sm">يقوم الذكاء الاصطناعي بتحليل النشاط...</h4>
                <p className="text-xs text-gray-500 mt-1">يتم الآن تجهيز العرض التسويقي والأداة البرمجية الأنسب لهم</p>
              </div>
            ) : outreachData ? (
              <>
                {/* Recommendation Box */}
                <div className="bg-indigo-50/80 border border-indigo-100 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs mb-1">
                    <Sparkles size={14} />
                    الحل البرمجي المقترح من متجرك:
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">{outreachData.recommendedTool}</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{outreachData.pitchReason}</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 gap-4 text-xs font-bold">
                  <button 
                    onClick={() => setActiveTab('whatsapp')}
                    className={`pb-2 flex items-center gap-1.5 transition-colors border-b-2 ${activeTab === 'whatsapp' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                  >
                    <MessageCircle size={15} />
                    رسالة واتساب الفورية
                  </button>
                  <button 
                    onClick={() => setActiveTab('email')}
                    className={`pb-2 flex items-center gap-1.5 transition-colors border-b-2 ${activeTab === 'email' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                  >
                    <Mail size={15} />
                    مسودة البريد الإلكتروني
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'whatsapp' ? (
                  <div className="space-y-3">
                    <div className="bg-emerald-50/60 border border-emerald-100 p-3.5 rounded-2xl text-xs text-gray-800 leading-relaxed relative font-sans whitespace-pre-line">
                      {outreachData.whatsappMessage}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openWhatsApp(outreachData.whatsappMessage, selectedPlace.nationalPhoneNumber)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <Send size={14} />
                        إرسال عبر واتساب الآن
                      </button>
                      <button
                        onClick={() => copyToClipboard(outreachData.whatsappMessage, 'whatsapp')}
                        className="p-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-600 transition-colors"
                        title="نسخ النص"
                      >
                        {copiedField === 'whatsapp' ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-2xl space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-gray-500">الموضوع: </span>
                        <span className="text-gray-900 font-medium">{outreachData.emailSubject}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 whitespace-pre-line text-gray-700 leading-relaxed">
                        {outreachData.emailBody}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openMailClient(outreachData.emailSubject, outreachData.emailBody)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <Mail size={14} />
                        فتح في برنامج البريد
                      </button>
                      <button
                        onClick={() => copyToClipboard(`${outreachData.emailSubject}\n\n${outreachData.emailBody}`, 'email')}
                        className="p-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-600 transition-colors"
                        title="نسخ النص"
                      >
                        {copiedField === 'email' ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Place contact options if available */}
                {(selectedPlace.nationalPhoneNumber || selectedPlace.websiteUri) && (
                  <div className="pt-3 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-500">
                    {selectedPlace.nationalPhoneNumber && (
                      <a href={`tel:${selectedPlace.nationalPhoneNumber}`} className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                        <PhoneCall size={12} />
                        {selectedPlace.nationalPhoneNumber}
                      </a>
                    )}
                    {selectedPlace.websiteUri && (
                      <a href={selectedPlace.websiteUri} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                        <Globe size={12} />
                        الموقع الإلكتروني
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="py-6 text-center text-xs text-gray-500">
                <button 
                  onClick={() => generateOutreach(selectedPlace)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
