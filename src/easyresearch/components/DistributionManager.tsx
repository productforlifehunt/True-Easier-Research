import React, { useState, useMemo } from 'react';
import { Link2, Mail, QrCode, Code, Share2, Copy, Check, ExternalLink, Users, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

// Distribution Manager — Multi-channel survey distribution
// 分发管理器 — 多渠道调查分发

interface DistributionChannel {
  id: string;
  type: 'link' | 'email' | 'embed' | 'qr' | 'social';
  name: string;
  url: string;
  clicks: number;
  responses: number;
  createdAt: string;
}

interface Props {
  projectId: string;
  surveyCode?: string;
  surveyTitle?: string;
}

const DistributionManager: React.FC<Props> = ({ projectId, surveyCode, surveyTitle }) => {
  const [activeTab, setActiveTab] = useState<'link' | 'email' | 'embed' | 'qr' | 'social'>('link');
  const [copied, setCopied] = useState(false);
  const [emailList, setEmailList] = useState('');
  const [emailSubject, setEmailSubject] = useState(`You're invited: ${surveyTitle || 'Survey'}`);
  const [emailBody, setEmailBody] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');

  // Build the survey URL / 构建调查链接
  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}/easyresearch/join/${surveyCode || projectId}` : '';

  const buildUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (utmSource) params.set('utm_source', utmSource);
    if (utmMedium) params.set('utm_medium', utmMedium);
    if (utmCampaign) params.set('utm_campaign', utmCampaign);
    const qs = params.toString();
    return qs ? `${baseUrl}?${qs}` : baseUrl;
  }, [baseUrl, utmSource, utmMedium, utmCampaign]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied! / 已复制！');
    setTimeout(() => setCopied(false), 2000);
  };

  // QR Code SVG generator (simple) / 二维码生成
  const generateQRSvg = (url: string, size: number = 200) => {
    // Using a basic QR placeholder — in production use a library
    // 使用基础QR占位符 — 生产环境使用专业库
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="white"/>
      <text x="${size/2}" y="${size/2}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#6b7280">QR: ${url.substring(0, 30)}...</text>
      <rect x="10" y="10" width="40" height="40" fill="#1f2937" rx="4"/>
      <rect x="${size-50}" y="10" width="40" height="40" fill="#1f2937" rx="4"/>
      <rect x="10" y="${size-50}" width="40" height="40" fill="#1f2937" rx="4"/>
      <rect x="15" y="15" width="30" height="30" fill="white" rx="2"/>
      <rect x="${size-45}" y="15" width="30" height="30" fill="white" rx="2"/>
      <rect x="15" y="${size-45}" width="30" height="30" fill="white" rx="2"/>
      <rect x="20" y="20" width="20" height="20" fill="#1f2937" rx="1"/>
      <rect x="${size-40}" y="20" width="20" height="20" fill="#1f2937" rx="1"/>
      <rect x="20" y="${size-40}" width="20" height="20" fill="#1f2937" rx="1"/>
    </svg>`;
  };

  // Embed code / 嵌入代码
  const embedCode = `<iframe src="${buildUrl}" width="100%" height="700" frameborder="0" style="border: none; border-radius: 12px; max-width: 640px; margin: 0 auto; display: block;"></iframe>`;
  const popupCode = `<script>
  window.EasierSurvey = { url: "${buildUrl}", trigger: "button", buttonText: "Take Survey" };
</script>
<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed.js" async></script>`;

  const tabs = [
    { id: 'link' as const, icon: Link2, label: 'Link / 链接' },
    { id: 'email' as const, icon: Mail, label: 'Email / 邮件' },
    { id: 'embed' as const, icon: Code, label: 'Embed / 嵌入' },
    { id: 'qr' as const, icon: QrCode, label: 'QR Code / 二维码' },
    { id: 'social' as const, icon: Share2, label: 'Social / 社交' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-800">Distribution / 分发管理</h2>
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Users size={13} /> Survey Code: <code className="bg-stone-100 px-2 py-0.5 rounded font-mono">{surveyCode || 'N/A'}</code>
        </div>
      </div>

      {/* Channel Tabs / 渠道选项卡 */}
      <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === t.id ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'
            }`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* Link Tab / 链接 */}
      {activeTab === 'link' && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-stone-600 mb-1 block">Survey URL / 调查链接</label>
            <div className="flex gap-2">
              <input type="text" value={buildUrl} readOnly
                className="flex-1 text-sm font-mono bg-stone-50 border border-stone-200 rounded-lg px-3 py-2" />
              <button onClick={() => copyToClipboard(buildUrl)}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-all flex items-center gap-1.5">
                {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="border-t border-stone-100 pt-4">
            <h4 className="text-xs font-semibold text-stone-700 mb-3">UTM Parameters / UTM参数</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-stone-500 mb-0.5 block">Source / 来源</label>
                <input type="text" value={utmSource} onChange={e => setUtmSource(e.target.value)}
                  className="w-full text-xs border border-stone-200 rounded-lg px-2 py-1.5" placeholder="newsletter" />
              </div>
              <div>
                <label className="text-[10px] text-stone-500 mb-0.5 block">Medium / 媒介</label>
                <input type="text" value={utmMedium} onChange={e => setUtmMedium(e.target.value)}
                  className="w-full text-xs border border-stone-200 rounded-lg px-2 py-1.5" placeholder="email" />
              </div>
              <div>
                <label className="text-[10px] text-stone-500 mb-0.5 block">Campaign / 活动</label>
                <input type="text" value={utmCampaign} onChange={e => setUtmCampaign(e.target.value)}
                  className="w-full text-xs border border-stone-200 rounded-lg px-2 py-1.5" placeholder="spring_2026" />
              </div>
            </div>
          </div>

          {/* Anonymous vs Authenticated / 匿名 vs 认证 */}
          <div className="bg-stone-50 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-stone-700 mb-2">Access Mode / 访问模式</h4>
            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded-lg text-xs font-medium border border-emerald-400 bg-emerald-50 text-emerald-700">
                Open Link / 开放链接
              </button>
              <button className="flex-1 py-2 rounded-lg text-xs font-medium border border-stone-200 text-stone-500 hover:border-stone-300">
                Auth Required / 需认证
              </button>
              <button className="flex-1 py-2 rounded-lg text-xs font-medium border border-stone-200 text-stone-500 hover:border-stone-300">
                Password / 密码保护
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Tab / 邮件 */}
      {activeTab === 'email' && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-stone-600 mb-1 block">Recipients / 收件人 (one per line)</label>
            <textarea value={emailList} onChange={e => setEmailList(e.target.value)}
              className="w-full text-xs border border-stone-200 rounded-lg px-3 py-2 h-24 font-mono"
              placeholder="participant1@email.com&#10;participant2@email.com" />
            <span className="text-[10px] text-stone-400 mt-1 block">
              {emailList.split('\n').filter(e => e.trim() && e.includes('@')).length} valid emails / 有效邮箱
            </span>
          </div>
          <div>
            <label className="text-xs font-medium text-stone-600 mb-1 block">Subject / 主题</label>
            <input type="text" value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
              className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-xs font-medium text-stone-600 mb-1 block">Message / 正文</label>
            <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)}
              className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 h-32"
              placeholder="Hi there,\n\nYou're invited to participate in our research study..." />
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-all flex items-center justify-center gap-1.5">
              <Mail size={13} /> Send Invitations / 发送邀请
            </button>
            <button className="px-4 py-2.5 border border-stone-200 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-50">
              Preview / 预览
            </button>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-700">⚠️ Email sending requires SMTP configuration. Configure in project settings.</p>
            <p className="text-[10px] text-amber-600 mt-0.5">邮件发送需要配置SMTP。请在项目设置中配置。</p>
          </div>
        </div>
      )}

      {/* Embed Tab / 嵌入 */}
      {activeTab === 'embed' && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-stone-600">iFrame Embed / 内嵌框架</label>
              <button onClick={() => copyToClipboard(embedCode)} className="text-[10px] text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                <Copy size={10} /> Copy / 复制
              </button>
            </div>
            <pre className="text-[11px] font-mono bg-stone-900 text-green-400 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">{embedCode}</pre>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-stone-600">Popup Widget / 弹出组件</label>
              <button onClick={() => copyToClipboard(popupCode)} className="text-[10px] text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                <Copy size={10} /> Copy / 复制
              </button>
            </div>
            <pre className="text-[11px] font-mono bg-stone-900 text-green-400 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">{popupCode}</pre>
          </div>
        </div>
      )}

      {/* QR Code Tab / 二维码 */}
      {activeTab === 'qr' && (
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white border-2 border-stone-200 rounded-2xl"
              dangerouslySetInnerHTML={{ __html: generateQRSvg(buildUrl, 200) }} />
            <p className="text-xs text-stone-500 text-center max-w-xs">
              Scan to access survey / 扫描访问调查
            </p>
            <div className="flex gap-2">
              <button onClick={() => {
                const blob = new Blob([generateQRSvg(buildUrl, 400)], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `survey-qr-${surveyCode || projectId}.svg`; a.click();
                URL.revokeObjectURL(url);
                toast.success('QR downloaded / 二维码已下载');
              }}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600">
                Download SVG / 下载SVG
              </button>
              <button onClick={() => copyToClipboard(buildUrl)}
                className="px-4 py-2 border border-stone-200 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-50">
                Copy URL / 复制链接
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Social Tab / 社交分享 */}
      {activeTab === 'social' && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-3">
          <h4 className="text-xs font-semibold text-stone-700 mb-2">Share on Social Media / 社交媒体分享</h4>
          {[
            { name: 'Twitter/X', color: '#000', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(buildUrl)}&text=${encodeURIComponent(`Participate in: ${surveyTitle}`)}` },
            { name: 'LinkedIn', color: '#0077b5', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(buildUrl)}` },
            { name: 'Facebook', color: '#1877f2', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(buildUrl)}` },
            { name: 'WhatsApp', color: '#25d366', url: `https://wa.me/?text=${encodeURIComponent(`${surveyTitle}: ${buildUrl}`)}` },
            { name: 'WeChat / 微信', color: '#07c160', url: '' },
          ].map(s => (
            <a key={s.name} href={s.url || '#'} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 hover:border-stone-300 transition-all">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: s.color }}>{s.name[0]}</div>
              <span className="text-sm font-medium text-stone-700 flex-1">{s.name}</span>
              <ExternalLink size={13} className="text-stone-400" />
            </a>
          ))}
        </div>
      )}

      {/* Distribution Analytics / 分发统计 */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-1.5"><BarChart3 size={14} /> Channel Performance / 渠道表现</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { channel: 'Direct Link / 直接链接', clicks: 0, responses: 0 },
            { channel: 'Email / 邮件', clicks: 0, responses: 0 },
            { channel: 'Embed / 嵌入', clicks: 0, responses: 0 },
            { channel: 'Social / 社交', clicks: 0, responses: 0 },
          ].map(c => (
            <div key={c.channel} className="p-3 bg-stone-50 rounded-lg text-center">
              <p className="text-[10px] text-stone-500 mb-1">{c.channel}</p>
              <p className="text-lg font-bold text-stone-800">{c.clicks}</p>
              <p className="text-[10px] text-stone-400">{c.responses} responses / 回复</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DistributionManager;
