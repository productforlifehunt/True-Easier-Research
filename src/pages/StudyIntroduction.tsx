import React, { useState } from 'react';
import DesktopHeader from '../components/DesktopHeader';
import IOSDropdown from '../components/ui/IOSDropdown';
import { Mic, Sparkles } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function StudyIntroduction() {
  const { language } = useLanguage();
  const zh = language === 'zh';
  
  // Mock state for demo dropdowns
  const [mockGender, setMockGender] = useState('female');
  const [mockEducation, setMockEducation] = useState('bachelor');
  const [mockEmployment, setMockEmployment] = useState('full_time');
  const [mockMarital, setMockMarital] = useState('married');
  const [mockHealth, setMockHealth] = useState('3');
  const [mockCaregivingDuration, setMockCaregivingDuration] = useState('1_2_years');
  const [mockDistance, setMockDistance] = useState('same_home');
  const [mockRecipientGender, setMockRecipientGender] = useState('female');
  const [mockDementiaType, setMockDementiaType] = useState('alzheimer');
  const [mockDementiaStage, setMockDementiaStage] = useState('middle');
  const [mockRecipientEducation, setMockRecipientEducation] = useState('high');
  const [mockAdl, setMockAdl] = useState('some_help');
  const [mockIadl, setMockIadl] = useState('some_help');
  const [mockBpsd, setMockBpsd] = useState('sometimes');
  const [mockRelationship, setMockRelationship] = useState('spouse');
  const [mockPerseverance, setMockPerseverance] = useState('year_to_two_years');

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <DesktopHeader />
      <article className="max-w-4xl mx-auto px-6 py-12" style={{ color: 'var(--text-primary)' }}>
        
        {/* Title */}
        <header className="text-center mb-12 border-b pb-8" style={{ borderColor: 'var(--border-light)' }}>
          <h1 className="text-3xl font-bold mb-4">{zh ? '痴呆症照护者日常照护调查：研究方案' : 'Daily Caregiving Survey for Dementia Caregivers: Study Protocol'}</h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>{zh ? '使用定制化应用程序（可安装为网页应用或iOS/Android应用）的纵向调查研究方案' : 'A Longitudinal Survey Study Protocol Using a Custom-Built App (Installable as Web App or iOS/Android App)'}</p>
        </header>

        {/* 1. Overview */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b" style={{ borderColor: 'var(--color-green)' }}>{zh ? '1. 研究概述与目标' : '1. Study Overview and Objectives'}</h2>
          
          <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            {zh 
              ? '本研究旨在通过一款专门设计的移动端网页应用程序，了解痴呆症家庭照护者的日常照护活动与需求。研究邀请两类参与者：主要照护者（承担主要照护责任的家庭成员）和其他照护者（如协助照护的其他家人、朋友、邻居、专业护理人员等）。参与者可选择：(A) 仅参与半结构化访谈；或 (B) 同时参与ESM日志记录研究和半结构化访谈。研究采用情境映射技术，通过照护网络图谱等可视化工具支持数据采集与访谈讨论。'
              : 'This study aims to understand the daily caregiving activities and needs of dementia family caregivers through a purpose-designed mobile web application. The study invites two types of participants: primary caregivers (family members with main caregiving responsibility) and other caregivers (e.g., other family members, friends, neighbors, professional care workers who assist with care). Participants may choose to: (A) participate in the semi-structured interview only; or (B) participate in both the ESM logging study and the semi-structured interview. The study employs context mapping techniques, using visualization tools such as care network diagrams to support data collection and interview discussions.'
            }
          </p>

          <h3 className="text-lg font-semibold mb-3 mt-6" style={{ color: 'var(--text-primary)' }}>
            {zh ? '1.1 研究目标' : '1.1 Study Objectives'}
          </h3>
          <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            {zh 
              ? '本研究的具体目标包括：(1) 绘制痴呆症家庭的完整照护网络图谱，了解不同照护者之间的分工协作模式和支持关系；(2) 通过实时记录的方式，详细记录照护者的日常照护活动，包括活动类型、时间分布、持续时长以及每项活动对照护者情绪状态的影响；(3) 系统性识别照护过程中遇到的各类挑战，以及照护者当前使用的资源和期望获得的支持工具；(4) 评估照护者对痴呆症疾病的知识水平和对痴呆症患者的态度倾向，为后续开发针对性的教育干预内容提供数据依据。'
              : 'The specific objectives of this study include: (1) Map the complete care network diagram of dementia families, understanding task distribution, collaboration patterns, and support relationships among different caregivers; (2) Through real-time recording, document in detail the daily caregiving activities of caregivers, including activity types, time distribution, duration, and the emotional impact of each activity on the caregiver; (3) Systematically identify various challenges encountered in the caregiving process, as well as resources currently used by caregivers and support tools they wish to have; (4) Assess caregivers\' knowledge level about dementia and their attitudes toward persons with dementia, providing data basis for subsequent development of targeted educational intervention content.'
            }
          </p>

        </section>

        {/* 2. Recruitment */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b" style={{ borderColor: 'var(--color-green)' }}>{zh ? '2. 招募' : '2. Recruitment'}</h2>
          
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            {zh ? '2.1 招募渠道' : '2.1 Recruitment Channels'}
          </h3>

          <h3 className="text-lg font-semibold mb-3 mt-6" style={{ color: 'var(--text-primary)' }}>
            {zh ? '2.2 纳入标准' : '2.2 Inclusion Criteria'}
          </h3>
          <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            {zh 
              ? '参与者需满足以下全部条件方可参加本研究：(1) 年龄满18周岁或以上；(2) 目前正在（作为主要或次要照护者）为一位被正式诊断为痴呆症（包括阿尔茨海默病、血管性痴呆、路易体痴呆、额颌叶痴呆、混合型痴呆等）的人提供照护；(3) 能够使用智能手机、平板电脑或计算机访问网页应用程序；(4) 能够阅读和理解中文；(5) 愿意参与半结构化访谈以分享照护经验。日常记录（ESM）为可选项目，参与者可根据自身情况决定是否进行七天的日常活动记录。'
              : 'Participants must meet all of the following criteria to participate in this study: (1) Aged 18 years or older; (2) Currently providing care (as a primary or secondary caregiver) for a person who has been formally diagnosed with dementia (including Alzheimer\'s disease, vascular dementia, Lewy body dementia, frontotemporal dementia, mixed dementia, etc.); (3) Able to use a smartphone, tablet, or computer to access the web application; (4) Able to read and understand Chinese; (5) Willing to participate in a semi-structured interview to share caregiving experiences. Daily logging (ESM) is optional—participants can decide whether to complete the seven-day daily activity logging based on their own circumstances.'
            }
          </p>
        </section>

        {/* 3. Primary Caregiver Procedures */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b" style={{ borderColor: 'var(--color-green)' }}>{zh ? '3. 主要照护者研究程序' : '3. Primary Caregiver Study Procedures'}</h2>
          
          <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            {zh 
              ? '参与者可选择：(A) 仅参与半结构化访谈；或 (B) 同时参与ESM日志记录研究和半结构化访谈。'
              : 'Participants may choose to: (A) participate in the semi-structured interview only; or (B) participate in both the ESM logging study and the semi-structured interview.'
            }
          </p>
          
          {/* Primary Caregiver Procedure Flowchart - GREEN ONLY, Full Section Names */}
          <div className="my-6 p-4 rounded-xl overflow-x-auto" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            {/* Row 1: Baseline Assessment Steps */}
            <div className="flex items-center gap-2 min-w-max justify-center flex-wrap mb-3">
              <div className="px-3 py-2 rounded-lg text-center text-xs font-medium text-white" style={{ backgroundColor: 'var(--color-green)', minWidth: '180px' }}>
                <div>{zh ? '3.1 访问研究页面并注册账户' : '3.1 Access Study Page and Register'}</div>
              </div>
              <div style={{ color: 'var(--color-green)' }}>→</div>
              <div className="px-3 py-2 rounded-lg text-center text-xs font-medium text-white" style={{ backgroundColor: 'var(--color-green)', minWidth: '160px' }}>
                <div>{zh ? '3.2 填写个人基本信息' : '3.2 Fill in Personal Information'}</div>
              </div>
              <div style={{ color: 'var(--color-green)' }}>→</div>
              <div className="px-3 py-2 rounded-lg text-center text-xs font-medium text-white" style={{ backgroundColor: 'var(--color-green)', minWidth: '180px' }}>
                <div>{zh ? '3.3 填写被照护者信息' : '3.3 Fill in Care Recipient Information'}</div>
              </div>
              <div style={{ color: 'var(--color-green)' }}>→</div>
              <div className="px-3 py-2 rounded-lg text-center text-xs font-medium text-white" style={{ backgroundColor: 'var(--color-green)', minWidth: '160px' }}>
                <div>{zh ? '3.4 绘制照护网络图' : '3.4 Map Care Network Diagram'}</div>
              </div>
            </div>
            {/* Row 2: Questionnaires, Invite, Logging, Interview */}
            <div className="flex items-center gap-2 min-w-max justify-center flex-wrap">
              <div className="px-3 py-2 rounded-lg text-center text-xs font-medium text-white" style={{ backgroundColor: 'var(--color-green)', minWidth: '220px' }}>
                <div>{zh ? '3.5 完成痴呆症知识与态度问卷' : '3.5 Complete Dementia Knowledge & Attitudes Questionnaires'}</div>
              </div>
              <div style={{ color: 'var(--color-green)' }}>→</div>
              <div className="px-3 py-2 rounded-lg text-center text-xs font-medium text-white" style={{ backgroundColor: 'var(--color-green)', minWidth: '180px' }}>
                <div>{zh ? '3.6 邀请其他照护者参与' : '3.6 Invite Other Caregivers to Participate'}</div>
              </div>
              <div style={{ color: 'var(--color-green)' }}>→</div>
              <div className="px-3 py-2 rounded-lg text-center text-xs font-medium border-2" style={{ borderColor: 'var(--color-green)', color: 'var(--color-green)', minWidth: '180px' }}>
                <div>{zh ? '3.7 周记录（日常照护活动）' : '3.7 Week-Long Logging (Daily Activities)'}</div>
              </div>
              <div style={{ color: 'var(--color-green)' }}>→</div>
              <div className="px-3 py-2 rounded-lg text-center text-xs font-medium border-2" style={{ borderColor: 'var(--color-green)', color: 'var(--color-green)', minWidth: '160px' }}>
                <div>{zh ? '3.8 参加半结构化访谈' : '3.8 Participate in Semi-Structured Interview'}</div>
              </div>
            </div>
          </div>
          
          {/* Step 3.1 Registration */}
          <div className="mb-8 p-5 rounded-xl border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--color-green)' }}>{zh ? '步骤 3.1：访问研究页面并注册账户' : 'Step 3.1: Access Study Page and Register Account'}</h3>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {zh 
                ? '主要照护者通过研究宣传渠道获得的链接访问应用程序首页。首页显示研究名称"痴呆症照护者日常照护调查"及简要介绍。参与者点击绿色的"加入研究"按钮进入注册流程。在注册页面，参与者首先阅读完整的研究知情同意书，了解研究目的、参与内容、数据使用方式、隐私保护措施及退出权利等信息。确认理解并同意后，勾选"我已阅读并同意知情同意书"选项，然后填写邮箱地址和密码创建账户。系统将发送验证邮件到填写的邮箱，参与者需点击邮件中的链接完成邮箱验证后方可登录使用应用程序。'
                : 'Primary caregivers access the application homepage through links obtained from research promotion channels. The homepage displays the study name "Daily Caregiving Survey for Dementia Caregivers" and a brief introduction. Participants click the green "Join Study" button to enter the registration process. On the registration page, participants first read the complete informed consent form to understand the study purpose, participation content, data usage, privacy protection measures, and withdrawal rights. After confirming understanding and agreement, check the "I have read and agree to the informed consent" option, then fill in email address and password to create an account. The system will send a verification email to the provided address, and participants must click the link in the email to complete email verification before logging in to use the application.'
              }
            </p>
            <div className="bg-white rounded-xl border p-4 mx-auto" style={{ maxWidth: '300px', borderColor: '#e5e7eb' }}>
              <div className="bg-gray-100 px-3 py-1.5 -mx-4 -mt-4 mb-3 text-xs text-center font-medium border-b" style={{ color: '#666' }}>{zh ? '应用界面示例：首页' : 'App Interface: Homepage'}</div>
              <div className="text-center mb-4">
                <div className="text-lg font-bold mb-1" style={{ color: 'var(--color-green)' }}>{zh ? '痴呆症照护者日常照护调查' : 'Dementia Caregiver Survey'}</div>
                <p className="text-xs" style={{ color: '#666' }}>{zh ? '了解照护者的日常生活与需求' : 'Understanding caregivers\' daily lives and needs'}</p>
              </div>
              <button className="w-full py-2.5 rounded-lg text-white text-sm font-medium mb-2" style={{ backgroundColor: 'var(--color-green)' }}>{zh ? '加入研究' : 'Join Study'}</button>
              <button className="w-full py-2.5 rounded-lg text-sm font-medium border" style={{ borderColor: '#e5e7eb', color: '#666' }}>{zh ? '已有账户？登录' : 'Have an account? Sign In'}</button>
            </div>
          </div>

          {/* Step 3.2 Personal Information - Pixel-perfect recreation of Settings page */}
          <div className="mb-8 p-5 rounded-xl border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--color-green)' }}>{zh ? '步骤 3.2：填写个人基本信息' : 'Step 3.2: Fill in Personal Information'}</h3>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {zh 
                ? '完成注册并登录后，系统引导参与者进入"设置"页面填写个人基本信息。以下为设置页面的界面截图：'
                : 'After completing registration and logging in, the system guides participants to the "Settings" page to fill in personal information. Below is a screenshot of the Settings page interface:'
              }
            </p>
            
            {/* Settings Page UI Recreation */}
            <div className="rounded-xl border-2" style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}>
              {/* Collapsible Header */}
              <div className="flex items-center justify-between p-4 rounded-t-xl" style={{ backgroundColor: '#f9fafb' }}>
                <span className="text-base font-medium" style={{ color: '#1f2937' }}>
                  {zh ? '主要照护者信息' : 'Primary Caregiver Information'}
                </span>
                <span style={{ color: '#6b7280' }}>▲</span>
              </div>
              
              {/* Form Content */}
              <div className="p-6 space-y-6" style={{ backgroundColor: 'white' }}>
                {/* Section A: Your Basic Information */}
                <div className="space-y-4">
                  <h5 className="text-sm font-semibold pb-2 border-b" style={{ color: 'var(--color-green)', borderColor: '#e5e7eb' }}>
                    {zh ? 'A. 您的基本信息' : 'A. Your Basic Information'}
                  </h5>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Age */}
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#6b7280' }}>{zh ? '年龄' : 'Age'}</label>
                      <div className="w-full px-3 py-2 rounded-lg border text-sm" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb', color: '#1f2937' }}>52</div>
                    </div>
                    {/* Gender */}
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#6b7280' }}>{zh ? '性别' : 'Gender'}</label>
                      <IOSDropdown
                        value={mockGender}
                        onChange={setMockGender}
                        placeholder={zh ? '请选择' : 'Select'}
                        options={[
                          { value: 'male', label: zh ? '男' : 'Male' },
                          { value: 'female', label: zh ? '女' : 'Female' }
                        ]}
                      />
                    </div>
                  </div>
                  
                  {/* Education */}
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#6b7280' }}>{zh ? '教育程度' : 'Education Level'}</label>
                    <IOSDropdown
                      value={mockEducation}
                      onChange={setMockEducation}
                      placeholder={zh ? '请选择' : 'Select'}
                      options={[
                        { value: 'elementary', label: zh ? '小学' : 'Elementary' },
                        { value: 'middle', label: zh ? '初中' : 'Middle School' },
                        { value: 'high', label: zh ? '高中' : 'High School' },
                        { value: 'associate', label: zh ? '专科' : 'Associate' },
                        { value: 'bachelor', label: zh ? '本科' : 'Bachelor' },
                        { value: 'master', label: zh ? '硕士' : 'Master' },
                        { value: 'doctorate', label: zh ? '博士' : 'Doctorate' }
                      ]}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Employment */}
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#6b7280' }}>{zh ? '就业状态' : 'Employment'}</label>
                      <IOSDropdown
                        value={mockEmployment}
                        onChange={setMockEmployment}
                        placeholder={zh ? '请选择' : 'Select'}
                        options={[
                          { value: 'full_time', label: zh ? '全职工作' : 'Employed full-time' },
                          { value: 'part_time', label: zh ? '兼职工作' : 'Employed part-time' },
                          { value: 'self_employed', label: zh ? '自由职业/个体经营' : 'Self-employed' },
                          { value: 'unemployed', label: zh ? '失业/待业' : 'Unemployed' },
                          { value: 'retired', label: zh ? '退休' : 'Retired' },
                          { value: 'student', label: zh ? '学生' : 'Student' }
                        ]}
                      />
                    </div>
                    {/* Marital Status */}
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#6b7280' }}>{zh ? '婚姻状态' : 'Marital Status'}</label>
                      <IOSDropdown
                        value={mockMarital}
                        onChange={setMockMarital}
                        placeholder={zh ? '请选择' : 'Select'}
                        options={[
                          { value: 'married', label: zh ? '已婚' : 'Married' },
                          { value: 'single', label: zh ? '单身' : 'Single' },
                          { value: 'divorced', label: zh ? '离异' : 'Divorced' },
                          { value: 'widowed', label: zh ? '丧偶' : 'Widowed' }
                        ]}
                      />
                    </div>
                  </div>
                  
                  {/* Self-rated Health */}
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#6b7280' }}>{zh ? '自评健康状况' : 'Self-rated Health'}</label>
                    <IOSDropdown
                      value={mockHealth}
                      onChange={setMockHealth}
                      placeholder={zh ? '请选择' : 'Select'}
                      options={[
                        { value: '1', label: zh ? '1（差）' : '1 (Poor)' },
                        { value: '2', label: '2' },
                        { value: '3', label: '3' },
                        { value: '4', label: '4' },
                        { value: '5', label: zh ? '5（很好）' : '5 (Excellent)' }
                      ]}
                    />
                  </div>
                  
                  {/* Relationship with Care Recipient */}
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#6b7280' }}>{zh ? '与被照护者的关系' : 'Relationship with Care Recipient'}</label>
                    <IOSDropdown
                      value={mockRelationship}
                      onChange={setMockRelationship}
                      placeholder={zh ? '请选择' : 'Select'}
                      options={[
                        { value: 'spouse', label: zh ? '配偶/伴侣' : 'Spouse/Partner' },
                        { value: 'child', label: zh ? '子女' : 'Child' },
                        { value: 'sibling', label: zh ? '兄弟姐妹' : 'Sibling' },
                        { value: 'parent', label: zh ? '父母' : 'Parent' },
                        { value: 'other_relative', label: zh ? '其他亲属' : 'Other Relative' },
                        { value: 'friend_neighbor', label: zh ? '朋友/邻居' : 'Friend/Neighbor' },
                        { value: 'professional', label: zh ? '专业护理人员' : 'Professional Caregiver' },
                        { value: 'other', label: zh ? '其他' : 'Other' }
                      ]}
                    />
                  </div>
                </div>
                
                {/* Section B: Caregiving Details */}
                <div className="space-y-4">
                  <h5 className="text-sm font-semibold pb-2 border-b" style={{ color: 'var(--color-green)', borderColor: '#e5e7eb' }}>
                    {zh ? 'B. 照护情况' : 'B. Caregiving Details'}
                  </h5>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Caregiving Duration */}
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#6b7280' }}>{zh ? '照护时长' : 'Duration of Caregiving'}</label>
                      <IOSDropdown
                        value={mockCaregivingDuration}
                        onChange={setMockCaregivingDuration}
                        placeholder={zh ? '请选择' : 'Select'}
                        options={[
                          { value: 'lt_6_months', label: zh ? '少于6个月' : 'Less than 6 months' },
                          { value: '6_months_1_year', label: zh ? '6个月 - 1年' : '6 months - 1 year' },
                          { value: '1_2_years', label: zh ? '1-2年' : '1-2 years' },
                          { value: '2_5_years', label: zh ? '2-5年' : '2-5 years' },
                          { value: 'gt_5_years', label: zh ? '超过5年' : 'More than 5 years' }
                        ]}
                      />
                    </div>
                    {/* Hours per Week */}
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#6b7280' }}>{zh ? '每周照护小时' : 'Hours per Week'}</label>
                      <div className="w-full px-3 py-2 rounded-lg border text-sm" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb', color: '#1f2937' }}>35</div>
                    </div>
                  </div>
                  
                  {/* Distance from Care Recipient */}
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#6b7280' }}>{zh ? '与被照护者的距离' : 'Distance from Care Recipient'}</label>
                    <IOSDropdown
                      value={mockDistance}
                      onChange={setMockDistance}
                      placeholder={zh ? '请选择' : 'Select'}
                      options={[
                        { value: 'same_home', label: zh ? '同住' : 'Same home' },
                        { value: 'same_building', label: zh ? '同楼' : 'Same building' },
                        { value: 'same_neighborhood', label: zh ? '同小区' : 'Same neighborhood' },
                        { value: 'same_city', label: zh ? '同城' : 'Same city' },
                        { value: 'different_city', label: zh ? '不同城市' : 'Different city' },
                        { value: 'different_province_country', label: zh ? '不同省/国家' : 'Different province/country' }
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-center mt-2 italic" style={{ color: 'var(--text-muted)' }}>{zh ? '图：设置页面 - 主要照护者信息表单' : 'Figure: Settings page - Primary Caregiver Information form'}</p>
          </div>

          {/* Step 3.3 Care Recipient Condition - Pixel-perfect recreation of Settings page */}
          <div className="mb-8 p-5 rounded-xl border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--color-green)' }}>{zh ? '步骤 3.3：填写被照护者信息' : 'Step 3.3: Fill in Care Recipient Information'}</h3>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {zh 
                ? '在"设置"页面的"被照护者信息"部分，参与者填写被照护者的基本信息和功能状态评估。以下为界面截图：'
                : 'In the "Care Recipient Information" section of the Settings page, participants fill in the care recipient\'s basic information and functional status assessment. Below is a screenshot of the interface:'
              }
            </p>
            
            {/* Settings Page UI Recreation - Care Recipient Section */}
            <div className="rounded-xl border-2" style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}>
              {/* Collapsible Header */}
              <div className="flex items-center justify-between p-4 rounded-t-xl" style={{ backgroundColor: '#f9fafb' }}>
                <span className="text-base font-medium" style={{ color: '#1f2937' }}>
                  {zh ? '被照护者信息' : 'Care Recipient Information'}
                </span>
                <span style={{ color: '#6b7280' }}>▲</span>
              </div>
              
              {/* Form Content */}
              <div className="p-6 space-y-4" style={{ backgroundColor: 'white' }}>
                {/* Basic Info Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#6b7280' }}>{zh ? '被照护者年龄' : 'Care Recipient Age'}</label>
                    <div className="w-full px-3 py-2 rounded-lg border text-sm" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb', color: '#1f2937' }}>78</div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#6b7280' }}>{zh ? '被照护者性别' : 'Care Recipient Gender'}</label>
                    <IOSDropdown
                      value={mockRecipientGender}
                      onChange={setMockRecipientGender}
                      placeholder={zh ? '请选择' : 'Select'}
                      options={[
                        { value: 'male', label: zh ? '男' : 'Male' },
                        { value: 'female', label: zh ? '女' : 'Female' }
                      ]}
                    />
                  </div>
                </div>
                
                {/* Dementia Type */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#6b7280' }}>{zh ? '失智症类型' : 'Dementia Type'}</label>
                  <IOSDropdown
                    value={mockDementiaType}
                    onChange={setMockDementiaType}
                    placeholder={zh ? '请选择' : 'Select'}
                    options={[
                      { value: 'alzheimer', label: zh ? '阿尔茨海默病' : "Alzheimer's Disease" },
                      { value: 'vascular', label: zh ? '血管性失智' : 'Vascular Dementia' },
                      { value: 'lewy_body', label: zh ? '路易体失智' : 'Lewy Body Dementia' },
                      { value: 'frontotemporal', label: zh ? '额颞叶失智' : 'Frontotemporal' },
                      { value: 'mixed', label: zh ? '混合型' : 'Mixed' },
                      { value: 'unknown', label: zh ? '不确定' : 'Unknown' }
                    ]}
                  />
                </div>
                
                {/* Years & Stage Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#6b7280' }}>{zh ? '确诊年数' : 'Years Since Diagnosis'}</label>
                    <div className="w-full px-3 py-2 rounded-lg border text-sm" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb', color: '#1f2937' }}>4</div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#6b7280' }}>{zh ? '失智症阶段 (临床失智评定量表)' : 'Dementia Stage (Clinical Dementia Rating)'}</label>
                    <IOSDropdown
                      value={mockDementiaStage}
                      onChange={setMockDementiaStage}
                      placeholder={zh ? '请选择' : 'Select'}
                      options={[
                        { value: 'cdr_0', label: zh ? 'CDR 0 - 正常' : 'CDR 0 - Normal' },
                        { value: 'cdr_0.5', label: zh ? 'CDR 0.5 - 极轻度失智' : 'CDR 0.5 - Very Mild Dementia' },
                        { value: 'cdr_1', label: zh ? 'CDR 1 - 轻度失智' : 'CDR 1 - Mild Dementia' },
                        { value: 'cdr_2', label: zh ? 'CDR 2 - 中度失智' : 'CDR 2 - Moderate Dementia' },
                        { value: 'cdr_3', label: zh ? 'CDR 3 - 重度失智' : 'CDR 3 - Severe Dementia' }
                      ]}
                    />
                  </div>
                </div>
                
                {/* Care Recipient Education */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#6b7280' }}>{zh ? '被照护者教育程度' : 'Care Recipient Education'}</label>
                  <IOSDropdown
                    value={mockRecipientEducation}
                    onChange={setMockRecipientEducation}
                    placeholder={zh ? '请选择' : 'Select'}
                    options={[
                      { value: 'none', label: zh ? '无正规教育' : 'No formal education' },
                      { value: 'elementary', label: zh ? '小学' : 'Elementary' },
                      { value: 'middle', label: zh ? '初中' : 'Middle School' },
                      { value: 'high', label: zh ? '高中' : 'High School' },
                      { value: 'associate', label: zh ? '专科' : 'Associate' },
                      { value: 'bachelor', label: zh ? '本科' : 'Bachelor' },
                      { value: 'master_above', label: zh ? '硕士及以上' : 'Master or above' }
                    ]}
                  />
                </div>
                
                {/* ADL Section */}
                <div className="pt-3 border-t" style={{ borderColor: '#e5e7eb' }}>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#6b7280' }}>{zh ? '日常生活活动能力 (ADL)' : 'Activities of Daily Living (ADL)'}</label>
                  <p className="text-xs mb-3" style={{ color: '#9ca3af' }}>{zh ? '被照护者在以下活动中需要多少帮助？' : 'How much help does the care recipient need with these activities?'}</p>
                  <div className="space-y-2">
                    {[
                      { en: 'Eating', zh: '进食' },
                      { en: 'Bathing', zh: '洗澡' },
                      { en: 'Dressing', zh: '穿衣' },
                      { en: 'Toileting', zh: '如厕' },
                      { en: 'Moving around', zh: '行动' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: '#1f2937' }}>{zh ? item.zh : item.en}</span>
                        <div style={{ width: '140px' }}>
                          <IOSDropdown
                            value={mockAdl}
                            onChange={setMockAdl}
                            placeholder={zh ? '请选择' : 'Select'}
                            options={[
                              { value: 'independent', label: zh ? '独立完成' : 'Independent' },
                              { value: 'some_help', label: zh ? '需要帮助' : 'Needs help' },
                              { value: 'dependent', label: zh ? '无法完成' : 'Cannot do' }
                            ]}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* IADL Section */}
                <div className="pt-3 border-t" style={{ borderColor: '#e5e7eb' }}>
                  <label className="block text-xs font-semibold mb-2" style={{ color: '#6b7280' }}>{zh ? '工具性日常活动能力 (IADL)' : 'Instrumental Activities of Daily Living (IADL)'}</label>
                  <div className="space-y-2">
                    {[
                      { en: 'Managing medications', zh: '管理药物' },
                      { en: 'Handling finances', zh: '处理财务' },
                      { en: 'Shopping', zh: '购物' },
                      { en: 'Preparing meals', zh: '准备餐食' },
                      { en: 'Housework', zh: '家务' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: '#1f2937' }}>{zh ? item.zh : item.en}</span>
                        <div style={{ width: '140px' }}>
                          <IOSDropdown
                            value={mockIadl}
                            onChange={setMockIadl}
                            placeholder={zh ? '请选择' : 'Select'}
                            options={[
                              { value: 'independent', label: zh ? '独立完成' : 'Independent' },
                              { value: 'some_help', label: zh ? '需要帮助' : 'Needs help' },
                              { value: 'cannot_do', label: zh ? '无法完成' : 'Cannot do' }
                            ]}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* NPI-Q Section - Neuropsychiatric Inventory Questionnaire */}
                <div className="pt-3 border-t" style={{ borderColor: '#e5e7eb' }}>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-green)' }}>{zh ? '神经精神症状问卷 (NPI-Q)' : 'Neuropsychiatric Inventory Questionnaire (NPI-Q)'}</label>
                  <p className="text-xs mb-3" style={{ color: '#9ca3af' }}>{zh ? '过去一个月内，被照护者是否出现以下症状？如有，请评估症状的严重程度（1-3分）和对您造成的困扰程度（0-5分）。' : 'In the past month, has the care recipient shown any of the following symptoms? If yes, rate severity (1-3) and your distress level (0-5).'}</p>
                  <div className="space-y-3">
                    {[
                      { en: '1. Delusions: Does the patient believe things that you know are not true?', zh: '1. 妄想：患者是否相信一些您知道不是真的事情？', example: zh ? '（如认为有人偷东西、配偶不忠、被遗弃等）' : '(e.g., believes things are being stolen, spouse is unfaithful, being abandoned)' },
                      { en: '2. Hallucinations: Does the patient see or hear things that are not there?', zh: '2. 幻觉：患者是否看到或听到不存在的事物？', example: zh ? '（如看到不存在的人或物、听到声音）' : '(e.g., seeing people/things not present, hearing voices)' },
                      { en: '3. Agitation/Aggression: Is the patient resistive or uncooperative, or hard to handle?', zh: '3. 激越/攻击：患者是否抗拒、不合作或难以处理？', example: zh ? '（如拒绝帮助、难以管理、喊叫、摔东西）' : '(e.g., refuses help, difficult to manage, shouts, throws things)' },
                      { en: '4. Depression/Dysphoria: Does the patient seem sad or depressed?', zh: '4. 抑郁/心境恶劣：患者是否看起来悲伤或抑郁？', example: zh ? '（如哭泣、对自己或未来感到悲观）' : '(e.g., cries, feels hopeless about self or future)' },
                      { en: '5. Anxiety: Is the patient very nervous, worried, or frightened?', zh: '5. 焦虑：患者是否非常紧张、担心或害怕？', example: zh ? '（如与照护者分离时焦虑、过度担心事件）' : '(e.g., upset when separated from caregiver, overly worried about events)' },
                      { en: '6. Elation/Euphoria: Does the patient seem too cheerful or happy without reason?', zh: '6. 欣快/情绪高涨：患者是否无缘无故地过于高兴？', example: zh ? '（如不适当的幽默感、自认有特殊能力）' : '(e.g., inappropriate humor, believes has special abilities)' },
                      { en: '7. Apathy/Indifference: Has the patient lost interest in the world around them?', zh: '7. 淡漠/冷漠：患者是否对周围的世界失去兴趣？', example: zh ? '（如对活动、与人交往失去兴趣）' : '(e.g., lost interest in activities, socializing)' },
                      { en: '8. Disinhibition: Does the patient act impulsively without thinking?', zh: '8. 脱抑制：患者是否不加思考地冲动行事？', example: zh ? '（如对陌生人过于友好、言语或行为不当）' : '(e.g., overly friendly to strangers, inappropriate speech or actions)' },
                      { en: '9. Irritability/Lability: Is the patient impatient and cranky?', zh: '9. 易激惹/情绪不稳：患者是否不耐烦和暴躁？', example: zh ? '（如情绪快速变化、容易发脾气）' : '(e.g., rapid mood changes, easily angered)' },
                      { en: '10. Aberrant Motor Behavior: Does the patient pace, do repetitive things?', zh: '10. 异常运动行为：患者是否踱步或重复做某些事？', example: zh ? '（如来回走动、反复开关抽屉、缠绕绳子）' : '(e.g., pacing, opening drawers repeatedly, winding string)' },
                      { en: '11. Sleep/Nighttime Behaviors: Does the patient have sleep disturbances?', zh: '11. 睡眠/夜间行为：患者是否有睡眠问题？', example: zh ? '（如夜间起床、过早醒来、白天过度睡眠）' : '(e.g., getting up at night, waking too early, excessive daytime sleep)' },
                      { en: '12. Appetite/Eating Changes: Has the patient had changes in appetite or eating?', zh: '12. 食欲/进食改变：患者的食欲或进食是否有变化？', example: zh ? '（如食欲下降/增加、体重变化、饮食偏好改变）' : '(e.g., appetite loss/increase, weight changes, food preference changes)' }
                    ].map((item, idx) => (
                      <div key={idx} className="p-2 rounded" style={{ backgroundColor: idx % 2 === 0 ? '#f9fafb' : 'white' }}>
                        <p className="text-xs font-medium mb-1" style={{ color: '#1f2937' }}>{zh ? item.zh : item.en}</p>
                        <p className="text-xs mb-2" style={{ color: '#9ca3af' }}>{item.example}</p>
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: '#6b7280' }}>{zh ? '存在：' : 'Present:'}</span>
                            <div className="flex gap-1">
                              <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>{zh ? '否' : 'No'}</span>
                              <span className="px-2 py-0.5 rounded text-xs text-white" style={{ backgroundColor: 'var(--color-green)' }}>{zh ? '是' : 'Yes'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: '#6b7280' }}>{zh ? '严重度：' : 'Severity:'}</span>
                            <div className="flex gap-1">
                              {[1, 2, 3].map(n => (
                                <span key={n} className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: n === 2 ? 'var(--color-green)' : '#f3f4f6', color: n === 2 ? 'white' : '#6b7280' }}>{n}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: '#6b7280' }}>{zh ? '困扰度：' : 'Distress:'}</span>
                            <div className="flex gap-1">
                              {[0, 1, 2, 3, 4, 5].map(n => (
                                <span key={n} className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: n === 3 ? '#F59E0B' : '#f3f4f6', color: n === 3 ? 'white' : '#6b7280' }}>{n}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-2 rounded text-xs" style={{ backgroundColor: '#f0fdf4', color: 'var(--text-secondary)' }}>
                    <strong>{zh ? '评分说明：' : 'Scoring:'}</strong> {zh ? '严重度：1=轻度，2=中度，3=重度；困扰度：0=无困扰，1=极少，2=轻度，3=中度，4=重度，5=极度' : 'Severity: 1=Mild, 2=Moderate, 3=Severe; Distress: 0=Not at all, 1=Minimally, 2=Mildly, 3=Moderately, 4=Severely, 5=Extremely'}
                  </div>
                </div>
                
                {/* Short Sense of Competence Questionnaire (SSCQ) Section */}
                <div className="pt-3 border-t" style={{ borderColor: '#e5e7eb' }}>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-green)' }}>{zh ? '照护能力感量表 (SSCQ)' : 'Short Sense of Competence Questionnaire (SSCQ)'}</label>
                  <p className="text-xs mb-3" style={{ color: '#9ca3af' }}>{zh ? '请根据您目前的照护经历，选择最符合您感受的选项（1=完全不同意 到 7=完全同意）' : 'Based on your current caregiving experience, select the option that best describes your feelings (1=Strongly Disagree to 7=Strongly Agree)'}</p>
                  <div className="space-y-2">
                    {[
                      { en: 'I feel strained in my interactions with my care recipient', zh: '我在与被照护者的互动中感到紧张' },
                      { en: "I feel that the present situation doesn't allow me as much privacy as I'd like", zh: '我觉得目前的情况没有给我足够的隐私空间' },
                      { en: 'I feel useful in my interactions with my care recipient', zh: '我觉得自己在与被照护者的互动中是有用的' },
                      { en: 'I feel that my social life has suffered', zh: '我觉得我的社交生活受到了影响' },
                      { en: 'I feel that my care recipient tries to manipulate me', zh: '我觉得被照护者试图操控我' },
                      { en: 'I feel that it is possible to find solutions to problems', zh: '我觉得问题是可以找到解决办法的' },
                      { en: 'I feel that my health has suffered', zh: '我觉得我的健康状况受到了影响' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-xs shrink-0 mt-0.5" style={{ color: '#1f2937' }}>{idx + 1}.</span>
                        <div className="flex-1">
                          <p className="text-xs mb-1" style={{ color: '#1f2937' }}>{zh ? item.zh : item.en}</p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5, 6, 7].map(n => (
                              <span key={n} className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: n === 4 ? 'var(--color-green)' : '#f3f4f6', color: n === 4 ? 'white' : '#6b7280' }}>
                                {n}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* MSPSS - Multidimensional Scale of Perceived Social Support */}
                <div className="pt-3 border-t" style={{ borderColor: '#e5e7eb' }}>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-green)' }}>{zh ? '感知社会支持多维量表 (MSPSS)' : 'Multidimensional Scale of Perceived Social Support (MSPSS)'}</label>
                  <p className="text-xs mb-3" style={{ color: '#9ca3af' }}>{zh ? '请评估您从以下来源感知到的社会支持（1=非常不同意 到 7=非常同意）' : 'Rate how you feel about social support from these sources (1=Very Strongly Disagree to 7=Very Strongly Agree)'}</p>
                  <p className="text-xs mb-2" style={{ color: '#6b7280' }}>{zh ? '完整12项MSPSS量表：重要他人(4项)、家庭(4项)、朋友(4项)' : 'Full 12-item MSPSS: Significant Other (4), Family (4), Friends (4)'}</p>
                </div>
                
                {/* Perseverance Time Section */}
                <div className="pt-3 border-t" style={{ borderColor: '#e5e7eb', position: 'relative', zIndex: 10 }}>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-green)' }}>{zh ? '当前持续照护意愿 (Perseverance Time)' : 'Current Perseverance Time'}</label>
                  <p className="text-xs mb-3" style={{ color: '#9ca3af' }}>{zh ? '如果照护情况保持现状，您认为您还能继续提供照护多长时间？' : 'If the caregiving situation remains as it is now, how long do you think you can continue providing care?'}</p>
                  <div style={{ position: 'relative', zIndex: 20 }}>
                    <IOSDropdown
                      value={mockPerseverance}
                      onChange={setMockPerseverance}
                      placeholder={zh ? '请选择' : 'Select'}
                      options={[
                        { value: 'less_than_week', label: zh ? '少于一周' : 'Less than a week' },
                        { value: 'week_to_month', label: zh ? '一周到一个月' : 'More than a week but less than a month' },
                        { value: 'month_to_six_months', label: zh ? '一个月到六个月' : 'More than a month but less than six months' },
                        { value: 'six_months_to_year', label: zh ? '六个月到一年' : 'More than six months but less than a year' },
                        { value: 'year_to_two_years', label: zh ? '一年到两年' : 'More than a year but less than two years' },
                        { value: 'more_than_two_years', label: zh ? '超过两年（请注明具体年数）' : 'More than two years (please specify duration)' }
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-center mt-2 italic" style={{ color: 'var(--text-muted)' }}>{zh ? '图：设置页面 - 被照护者信息表单' : 'Figure: Settings page - Care Recipient Information form'}</p>
          </div>

          {/* Step 3.4 Care Network */}
          <div className="mb-8 p-5 rounded-xl border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--color-green)' }}>{zh ? '步骤 3.4：绘制照护网络图' : 'Step 3.4: Map Care Network Diagram'}</h3>
            <div className="mb-3 p-3 rounded-lg border" style={{ backgroundColor: '#fef3c7', borderColor: '#fcd34d' }}>
              <p className="text-sm font-medium" style={{ color: '#92400e' }}>
                {zh ? '📹 视频指导：参与者将观看一段操作指导视频，演示如何绘制和管理照护网络图。' : '📹 Video Instruction: Participants will be shown a video tutorial demonstrating how to map and manage their care network diagram.'}
              </p>
            </div>
            <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {zh 
                ? '在"设置"页面的"我的照护网络"部分，参与者可以添加所有参与照护工作的人员，构建一个完整的照护网络图（Ecogram）。照护网络成员可以在初始设置时添加，也可以在七天日常记录期间随时添加。添加的成员会自动出现在日常记录表单的人员选择列表中供快速选择。此外，参与者还可以邀请已添加的照护网络成员作为"其他照护者"参与研究。点击"添加成员"按钮后，为每位成员填写以下信息：'
                : 'In the "My Care Network" section of the Settings page, participants can add all persons involved in caregiving to build a complete care network diagram (Ecogram). Network members can be added during initial setup or at any time during the seven-day logging period. Added members automatically appear in the person selection list in daily entry forms for quick selection. Additionally, participants can invite added network members to participate in the study as "Other Caregivers". After clicking "Add Member", fill in the following for each member:'
              }
            </p>
            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}><strong>{zh ? '(1) 成员姓名或称呼：' : '(1) Name/Nickname:'}</strong>{zh ? '可使用真名、昵称或代号（如"女儿"、"护工小李"等）。' : ' Real name, nickname, or identifier (e.g., "Daughter", "Aide Li").'}</p>
            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}><strong>{zh ? '(2) 与您的关系：' : '(2) Relationship:'}</strong>{zh ? '配偶/伴侣、子女、兄弟姐妹、其他亲属、朋友/邻居、专业护理人员、其他。' : ' Spouse/partner, child, sibling, other relative, friend/neighbor, professional caregiver, other.'}</p>
            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}><strong>{zh ? '(3) 提供的支持类型（可多选）：' : '(3) Support Types (multiple selection):'}</strong></p>
            <div className="text-sm mb-2 pl-4" style={{ color: 'var(--text-secondary)' }}>
              <div>• <strong>{zh ? '临床护理' : 'Clinical'}:</strong> {zh ? '服药、医疗任务（导尿管、伤口护理）' : 'medication, medical tasks (catheter, wound care)'}</div>
              <div>• <strong>{zh ? '功能性护理' : 'Functional'}:</strong> {zh ? '进食/饮食、洗澡、穿衣、打理仪容、如厕、行动' : 'feeding/eating, bathing, dressing, grooming, toileting, ambulation'}</div>
              <div>• <strong>{zh ? '认知支持' : 'Cognitive'}:</strong> {zh ? '定向（时间、日期、姓名、地点）、对话、回答问题、当前事件' : 'orientation (time, day, names, location), conversation, answering questions, current events'}</div>
              <div>• <strong>{zh ? '决策支持' : 'Decision Making'}:</strong> {zh ? '医疗决策、财务决策、非医疗决策' : 'medical decisions, financial decisions, non-medical decisions'}</div>
              <div>• <strong>{zh ? '家务' : 'Housekeeping'}:</strong> {zh ? '准备饭菜、清洁房屋/庭院、购物、管理衣物' : 'preparing meals, cleaning house/yard, shopping, managing wardrobe'}</div>
              <div>• <strong>{zh ? '信息管理' : 'Info Management'}:</strong> {zh ? '协调照护、与照护团队沟通、管理财务/账单' : 'coordinating care, communicating with care team, managing finances/bills'}</div>
              <div>• <strong>{zh ? '后勤安排' : 'Logistics'}:</strong> {zh ? '安排预约、提醒、确保必需品供应' : 'scheduling appointments, reminding, ensuring delivery of necessities'}</div>
              <div>• <strong>{zh ? '交通接送' : 'Transportation'}:</strong> {zh ? '驾车、安排乘车、陪同就诊' : 'driving, arranging rides, accompanying to appointments'}</div>
              <div>• <strong>Companionship:</strong> {zh ? '社交互动、对话、游戏、音乐、散步、外出' : 'social interaction, conversation, games, music, walks, outings'}</div>
              <div>• <strong>Caregiver Support:</strong> {zh ? '为其他照护者提供情感支持、填补/喘息' : 'emotional support for other caregivers, filling in/respite'}</div>
              <div>• <strong>Vigilance:</strong> {zh ? '监督、安全监控、陪同散步/跑腿、防止游荡' : 'supervision, safety monitoring, accompanying on walks/errands, preventing wandering'}</div>
              <div>• <strong>Pet Care:</strong> {zh ? '鄁狗、喂养、兽医就诊、宠物管理' : 'walking pets, feeding, vet visits, pet management'}</div>
              <div>• <strong>Skill Development:</strong> {zh ? '参加课程、阅读书籍、自我反思、学习痴呆症知识' : 'attending classes, reading books, self-reflection, learning about dementia'}</div>
            </div>
            <p className="text-xs italic mt-2 mb-2" style={{ color: 'var(--text-muted)' }}>
              {zh 
                ? '注：活动分类系统基于Ponnala等人 (2020)的研究，本研究旨在进一步了解中国情境下的网络化照护活动特征。'
                : 'Note: Activity categorization based on Ponnala et al. (2020), which this research aims to further understand in the context of networked caregiving activities in China.'
              }
            </p>
            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}><strong>{zh ? '(4) 支持频率：' : '(4) Support Frequency:'}</strong>{zh ? '每天、每周几次、每周一次、每月几次、偶尔/需要时。支持频率决定成员在网络图中的位置：近圈（必要支持）、中圈（定期支持）、远圈（偶尔支持）。' : ' Daily, several times/week, once/week, several times/month, occasionally. Support frequency determines member position in the diagram: Close circle (essential support), Medium circle (regular support), Distant circle (sporadic support).'}</p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}><strong>{zh ? '(5) 对照护的重要程度：' : '(5) Importance:'}</strong>{zh ? '非常重要、比较重要、一般重要、不太重要。该评分影响连接线的粗细。' : ' Very important, fairly important, somewhat important, not very important. This affects the thickness of connection lines.'}</p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {zh ? '完成添加后，照护网络以同心圆图形呈现：主要照护者位于圆心，其他成员根据支持频率分布在不同圆环上：近圈为必要支持（每天/经常）、中圈为定期支持、远圈为偶尔支持。点击任意成员节点可查看或编辑其详细信息。' : 'After adding, the network is visualized as concentric circles: the primary caregiver is at the center, members are distributed on different rings by support frequency: Close circle for essential support (daily/frequent), Medium circle for regular support, Distant circle for sporadic support. Click any member node to view/edit details.'}
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Care Network Visualization */}
              <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#e5e7eb' }}>
                <div className="bg-gray-100 px-3 py-1.5 -mx-4 -mt-4 mb-3 text-xs text-center font-medium border-b" style={{ color: '#666' }}>{zh ? '照护网络图' : 'Care Network'}</div>
                <div className="relative mx-auto" style={{ width: '200px', height: '200px' }}>
                  <div className="absolute inset-0 rounded-full border-2 border-dashed" style={{ borderColor: '#e0f2f1' }}></div>
                  <div className="absolute rounded-full border-2 border-dashed" style={{ top: '16%', left: '16%', width: '68%', height: '68%', borderColor: '#b2dfdb' }}></div>
                  <div className="absolute rounded-full border-2 border-dashed" style={{ top: '32%', left: '32%', width: '36%', height: '36%', borderColor: '#80cbc4' }}></div>
                  <span className="absolute text-xs" style={{ top: '2%', left: '50%', transform: 'translateX(-50%)', color: '#9CA3AF', fontSize: '8px' }}>{zh ? '远: 偶尔支持' : 'Distant: sporadic support'}</span>
                  <span className="absolute text-xs" style={{ top: '18%', left: '8%', color: '#9CA3AF', fontSize: '8px' }}>{zh ? '中: 定期支持' : 'Medium: regular support'}</span>
                  <span className="absolute text-xs" style={{ top: '34%', left: '50%', transform: 'translateX(-50%)', color: '#9CA3AF', fontSize: '8px' }}>{zh ? '近: 必要支持' : 'Close: essential support'}</span>
                  <div className="absolute rounded-full flex items-center justify-center text-white font-bold" style={{ top: '40%', left: '40%', width: '20%', height: '20%', backgroundColor: 'var(--color-green)', fontSize: '7px', textAlign: 'center', lineHeight: 1.1 }}>{zh ? '主要照护者' : 'Primary'}</div>
                  <div className="absolute rounded-full flex flex-col items-center justify-center text-white" style={{ top: '22%', left: '42%', width: '30px', height: '30px', backgroundColor: '#8B5CF6', fontSize: '8px' }}><span style={{ fontWeight: 'bold' }}>{zh ? '女儿' : 'Daughter'}</span></div>
                  <div className="absolute rounded-full flex flex-col items-center justify-center text-white" style={{ top: '38%', left: '70%', width: '28px', height: '28px', backgroundColor: '#A78BFA', fontSize: '7px' }}><span style={{ fontWeight: 'bold' }}>{zh ? '儿子' : 'Son'}</span></div>
                  <div className="absolute rounded-full flex flex-col items-center justify-center text-white" style={{ top: '68%', left: '58%', width: '26px', height: '26px', backgroundColor: '#A855F7', fontSize: '7px' }}><span style={{ fontWeight: 'bold' }}>{zh ? '护工' : 'Aide'}</span></div>
                  <div className="absolute rounded-full flex flex-col items-center justify-center text-white" style={{ top: '8%', left: '68%', width: '24px', height: '24px', backgroundColor: '#84CC16', fontSize: '7px' }}><span style={{ fontWeight: 'bold' }}>{zh ? '邻居' : 'Nbr'}</span></div>
                  <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                    <line x1="50%" y1="50%" x2="50%" y2="30%" stroke="var(--color-green)" strokeWidth="2" />
                    <line x1="50%" y1="50%" x2="75%" y2="45%" stroke="var(--color-green)" strokeWidth="1.5" strokeDasharray="4" />
                    <line x1="50%" y1="50%" x2="65%" y2="75%" stroke="var(--color-green)" strokeWidth="1.5" strokeDasharray="4" />
                    <line x1="50%" y1="50%" x2="75%" y2="16%" stroke="var(--color-green)" strokeWidth="1" strokeDasharray="2" />
                  </svg>
                </div>
                <div className="flex gap-2 mt-3 justify-center">
                  <button className="px-3 py-1.5 rounded-lg text-white text-xs font-medium" style={{ backgroundColor: 'var(--color-green)' }}>+ {zh ? '添加成员' : 'Add Member'}</button>
                  <button className="px-3 py-1.5 rounded-lg text-white text-xs font-medium" style={{ backgroundColor: 'var(--color-green)' }}>{zh ? '保存' : 'Save'}</button>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium border" style={{ borderColor: '#e5e7eb' }}>{zh ? '导出' : 'Export'}</button>
                </div>
              </div>
              
              {/* Add Member Form - Pixel Perfect */}
              <div className="bg-white rounded-xl border p-4 overflow-y-auto" style={{ borderColor: '#e5e7eb', maxHeight: '400px' }}>
                <div className="bg-gray-100 px-3 py-1.5 -mx-4 -mt-4 mb-3 text-xs text-center font-medium border-b" style={{ color: '#666' }}>{zh ? '添加网络成员' : 'Add Network Member'}</div>
                <div className="space-y-3">
                  {/* Name, Age, Gender Row */}
                  <div className="flex gap-2">
                    <div className="flex-1 p-2 border rounded text-sm" style={{ borderColor: '#e5e7eb', backgroundColor: '#f8fafc' }}>{zh ? '女儿小美' : 'Daughter Amy'}</div>
                    <div className="w-14 p-2 border rounded text-sm text-center" style={{ borderColor: '#e5e7eb', backgroundColor: '#f8fafc' }}>35</div>
                    <div className="w-16 p-2 border rounded text-sm flex justify-between items-center" style={{ borderColor: '#e5e7eb', backgroundColor: '#f8fafc' }}>
                      <span>{zh ? '女' : 'F'}</span>
                      <span style={{ color: '#9ca3af' }}>▼</span>
                    </div>
                  </div>
                  
                  {/* Relationship */}
                  <div className="w-full p-2 border rounded text-sm flex justify-between items-center" style={{ borderColor: '#e5e7eb', backgroundColor: '#f8fafc' }}>
                    <span>{zh ? '子女' : 'Child'}</span>
                    <span style={{ color: '#9ca3af' }}>▼</span>
                  </div>
                  
                  {/* Geographical Distance */}
                  <div>
                    <label className="text-xs block mb-1" style={{ color: '#6B7280' }}>{zh ? '地理距离' : 'Geographical Distance'}</label>
                    <div className="grid grid-cols-3 gap-1">
                      <button className="py-1 rounded text-xs" style={{ backgroundColor: '#f8fafc' }}>{zh ? '同住' : 'Same Home'}</button>
                      <button className="py-1 rounded text-xs" style={{ backgroundColor: '#f8fafc' }}>{zh ? '同楼' : 'Same building'}</button>
                      <button className="py-1 rounded text-xs text-white" style={{ backgroundColor: 'var(--color-green)' }}>{zh ? '同小区' : 'Same neighborhood'}</button>
                      <button className="py-1 rounded text-xs" style={{ backgroundColor: '#f8fafc' }}>{zh ? '同城' : 'Same city'}</button>
                      <button className="py-1 rounded text-xs" style={{ backgroundColor: '#f8fafc' }}>{zh ? '不同城市' : 'Different city'}</button>
                      <button className="py-1 rounded text-xs" style={{ backgroundColor: '#f8fafc' }}>{zh ? '不同省/国家' : 'Different province/country'}</button>
                    </div>
                  </div>
                  
                  {/* Frequency */}
                  <div>
                    <label className="text-xs block mb-1" style={{ color: '#6B7280' }}>{zh ? '支持频率' : 'Frequency of Support'}</label>
                    <div className="grid grid-cols-4 gap-1">
                      <button className="py-1 rounded text-xs" style={{ backgroundColor: '#f8fafc' }}>{zh ? '每天' : 'Daily'}</button>
                      <button className="py-1 rounded text-xs text-white" style={{ backgroundColor: 'var(--color-green)' }}>{zh ? '每周' : 'Weekly'}</button>
                      <button className="py-1 rounded text-xs" style={{ backgroundColor: '#f8fafc' }}>{zh ? '每月' : 'Monthly'}</button>
                      <button className="py-1 rounded text-xs" style={{ backgroundColor: '#f8fafc' }}>{zh ? '偶尔' : 'Occasionally'}</button>
                    </div>
                  </div>
                  
                  {/* Importance Slider */}
                  <div>
                    <label className="text-xs block mb-1" style={{ color: '#6B7280' }}>{zh ? '重要程度' : 'Importance'}: 75/100</label>
                    <div className="relative h-2 rounded-full bg-gray-200">
                      <div className="absolute left-0 h-full rounded-full" style={{ width: '75%', backgroundColor: 'var(--color-green)' }}></div>
                      <div className="absolute w-4 h-4 rounded-full -top-1 border-2 border-white shadow" style={{ left: '75%', backgroundColor: 'var(--color-green)', transform: 'translateX(-50%)' }}></div>
                    </div>
                  </div>
                  
                  {/* Support Direction */}
                  <div>
                    <label className="text-xs block mb-1" style={{ color: '#6B7280' }}>{zh ? '支持方向' : 'Support Direction'}</label>
                    <div className="grid grid-cols-3 gap-1">
                      <button className="py-1 rounded text-xs" style={{ backgroundColor: '#f8fafc' }}>→me</button>
                      <button className="py-1 rounded text-xs" style={{ backgroundColor: '#f8fafc' }}>me→</button>
                      <button className="py-1 rounded text-xs text-white" style={{ backgroundColor: 'var(--color-green)' }}>me↔</button>
                    </div>
                  </div>
                  
                  {/* Support Types - ADL, IADL, Maintenance */}
                  <div className="space-y-2">
                    <label className="text-xs block" style={{ color: '#6B7280' }}>{zh ? '支持类型' : 'Support Types'}</label>
                    <div className="p-2 rounded border" style={{ borderColor: '#e5e7eb', backgroundColor: '#f8fafc' }}>
                      <span className="text-xs font-medium" style={{ color: 'var(--color-green)' }}>ADL</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <button className="py-0.5 px-2 rounded text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '临床' : 'Clinical'}</button>
                        <button className="py-0.5 px-2 rounded text-xs text-white" style={{ backgroundColor: 'var(--color-green)' }}>{zh ? '功能性' : 'Functional'}</button>
                        <button className="py-0.5 px-2 rounded text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '认知' : 'Cognitive'}</button>
                      </div>
                    </div>
                    <div className="p-2 rounded border" style={{ borderColor: '#e5e7eb', backgroundColor: '#f8fafc' }}>
                      <span className="text-xs font-medium" style={{ color: 'var(--color-green)' }}>IADL</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <button className="py-0.5 px-2 rounded text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '决策' : 'Decision'}</button>
                        <button className="py-0.5 px-2 rounded text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '家务' : 'Housekeeping'}</button>
                        <button className="py-0.5 px-2 rounded text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '信息' : 'Info'}</button>
                        <button className="py-0.5 px-2 rounded text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '后勤' : 'Logistics'}</button>
                        <button className="py-0.5 px-2 rounded text-xs text-white" style={{ backgroundColor: 'var(--color-green)' }}>{zh ? '交通' : 'Transport'}</button>
                      </div>
                    </div>
                    <div className="p-2 rounded border" style={{ borderColor: '#e5e7eb', backgroundColor: '#f8fafc' }}>
                      <span className="text-xs font-medium" style={{ color: 'var(--color-green)' }}>{zh ? '维护性' : 'Maintenance'}</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <button className="py-0.5 px-2 rounded text-xs text-white" style={{ backgroundColor: 'var(--color-green)' }}>{zh ? '陪伴' : 'Companionship'}</button>
                        <button className="py-0.5 px-2 rounded text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '照护者支持' : 'Caregiver Support'}</button>
                        <button className="py-0.5 px-2 rounded text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '监护' : 'Vigilance'}</button>
                        <button className="py-0.5 px-2 rounded text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '宠物' : 'Pet'}</button>
                        <button className="py-0.5 px-2 rounded text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '技能' : 'Skill'}</button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Add Button */}
                  <button className="w-full py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: 'var(--color-green)' }}>{zh ? '添加' : 'Add'}</button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3.5 Questionnaires */}
          <div className="mb-8 p-5 rounded-xl border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--color-green)' }}>{zh ? '步骤 3.5：完成痴呆症知识与态度问卷' : 'Step 3.5: Complete Dementia Knowledge and Attitudes Questionnaires'}</h3>
            <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {zh ? '在"设置"页面的"关于失智症的了解"部分，参与者需完成两套标准化问卷，评估对痴呆症的知识和态度。' : 'In the "Understanding Dementia" section of Settings, participants complete two standardized questionnaires assessing dementia knowledge and attitudes.'}
            </p>
            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              <strong>{zh ? '阿尔茨海默病知识量表(ADKS)：' : 'Alzheimer\'s Disease Knowledge Scale (ADKS):'}</strong>
              {zh ? 'Carpenter等人(2009)开发，30道"对/错"判断题，涵盖七个知识领域：风险因素、评估与诊断、症状、疾病进程、生活影响、照护、治疗与管理。每道正确计1分，总分0-30分，分数越高表示知识水平越高。' : ' Developed by Carpenter et al. (2009), 30 true/false items covering seven domains: risk factors, assessment/diagnosis, symptoms, disease course, life impact, caregiving, treatment/management. 1 point per correct answer, total 0-30, higher = more knowledge.'}
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              <strong>{zh ? '痴呆症态度量表(DAS)：' : 'Dementia Attitudes Scale (DAS):'}</strong>
              {zh ? 'O\'Connor和McFadden(2010)开发，20道陈述题，7点李克特量表（1=非常不同意到7=非常同意）。测量两个维度：对痴呆症患者的舒适度和知识自信度。总分20-140分，分数越高表示态度越积极。' : ' Developed by O\'Connor & McFadden (2010), 20 statements on 7-point Likert scale (1=strongly disagree to 7=strongly agree). Measures two dimensions: comfort with dementia patients and knowledge confidence. Total 20-140, higher = more positive attitudes.'}
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="bg-white rounded-xl border p-4 flex-1" style={{ borderColor: '#e5e7eb' }}>
                <div className="bg-gray-100 px-3 py-1.5 -mx-4 -mt-4 mb-3 text-xs text-center font-medium border-b" style={{ color: '#666' }}>{zh ? 'ADKS问卷示例' : 'ADKS Example'}</div>
                <div className="p-3 rounded mb-2" style={{ backgroundColor: '#f8fafc' }}>
                  <p className="text-xs mb-2">1. {zh ? '阿尔茨海默病患者特别容易出现抑郁症状。' : 'People with Alzheimer\'s are particularly prone to depression.'}</p>
                  <div className="flex gap-2"><button className="flex-1 py-1.5 rounded text-xs border-2" style={{ borderColor: 'var(--color-green)', color: 'var(--color-green)' }}>{zh ? '对' : 'True'}</button><button className="flex-1 py-1.5 rounded text-xs bg-gray-100">{zh ? '错' : 'False'}</button></div>
                </div>
                <div className="p-3 rounded" style={{ backgroundColor: '#f8fafc' }}>
                  <p className="text-xs mb-2">2. {zh ? '大多数阿尔茨海默病患者生活在养老院中。' : 'Most people with Alzheimer\'s live in nursing homes.'}</p>
                  <div className="flex gap-2"><button className="flex-1 py-1.5 rounded text-xs bg-gray-100">{zh ? '对' : 'True'}</button><button className="flex-1 py-1.5 rounded text-xs border-2" style={{ borderColor: 'var(--color-green)', color: 'var(--color-green)' }}>{zh ? '错' : 'False'}</button></div>
                </div>
                <p className="text-xs text-center mt-2" style={{ color: '#999' }}>{zh ? '第2/30题' : '2/30'}</p>
              </div>
              <div className="bg-white rounded-xl border p-4 flex-1" style={{ borderColor: '#e5e7eb' }}>
                <div className="bg-gray-100 px-3 py-1.5 -mx-4 -mt-4 mb-3 text-xs text-center font-medium border-b" style={{ color: '#666' }}>{zh ? 'DAS问卷示例' : 'DAS Example'}</div>
                <div className="p-3 rounded" style={{ backgroundColor: '#f8fafc' }}>
                  <p className="text-xs mb-2">{zh ? '"我对与痴呆症患者交流感到自在。"' : '"I feel comfortable around people with dementia."'}</p>
                  <div className="flex items-center gap-1"><span className="text-xs">{zh ? '不同意' : 'Disagree'}</span><div className="flex gap-0.5 flex-1 justify-center">{[1,2,3,4,5,6,7].map(n => (<button key={n} className={`w-6 h-6 rounded text-xs ${n === 5 ? 'text-white' : 'bg-gray-100'}`} style={n === 5 ? { backgroundColor: 'var(--color-green)' } : {}}>{n}</button>))}</div><span className="text-xs">{zh ? '同意' : 'Agree'}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3.6 Invite */}
          <div className="mb-8 p-5 rounded-xl border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--color-green)' }}>{zh ? '步骤 3.6：邀请其他照护者参与' : 'Step 3.6: Invite Other Caregivers to Participate'}</h3>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {zh 
                ? '完成筛选问卷后，主要照护者可通过“加入/邀请”页面邀请照护网络中的其他成员参与。点击“生成邀请链接”后，系统生成唯一链接。主要照护者可通过微信、短信、邮件或其他方式分享此链接。被邀请者通过该链接注册后，系统自动将其标记为“其他照护者”角色，并与主要照护者关联。其他照护者仅需完成注册和日常记录，不需要填写照护对象状况或绘制网络。邀请更多成员将帮助研究团队更全面了解整个照护网络的运作模式。'
                : 'After completing screening questions, primary caregivers can invite other care network members through the "Join/Invite" page. Click "Generate Invitation Link" to create a unique link. Share via WeChat, SMS, email, or other methods. Invitees who register through this link are automatically marked as "Other Caregiver" and linked to the primary caregiver. Other caregivers only complete registration and daily logging, without care recipient condition or network mapping. Inviting more members helps the research team better understand the entire care network operation.'
              }
            </p>
            <div className="bg-white rounded-xl border p-4 mx-auto" style={{ maxWidth: '320px', borderColor: '#e5e7eb' }}>
              <div className="bg-gray-100 px-3 py-1.5 -mx-4 -mt-4 mb-3 text-xs text-center font-medium border-b" style={{ color: '#666' }}>{zh ? '邀请其他照护者' : 'Invite Other Caregivers'}</div>
              <div className="text-center">
                <div className="text-3xl mb-2">📨</div>
                <h4 className="font-medium mb-2 text-sm" style={{ color: '#333' }}>{zh ? '邀请您的照护网络成员' : 'Invite Your Care Network'}</h4>
                <p className="text-xs mb-3" style={{ color: '#666' }}>{zh ? '分享链接邀请家人、朋友或专业人员参与研究' : 'Share link to invite family, friends, or professionals'}</p>
                <div className="p-2 rounded bg-gray-50 text-xs mb-3 break-all font-mono">https://caregiversurvey.app/join/ABC123XYZ</div>
                <div className="flex gap-2"><button className="flex-1 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: 'var(--color-green)' }}>{zh ? '复制链接' : 'Copy Link'}</button><button className="flex-1 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: '#e5e7eb' }}>{zh ? '分享' : 'Share'}</button></div>
              </div>
            </div>
          </div>

          {/* Step 3.7 Daily Logging */}
          <div className="mb-8 p-5 rounded-xl border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--color-green)' }}>{zh ? '步骤 3.7：周记录（日常照护活动）' : 'Step 3.7: Week-Long Logging (Daily Caregiving Activities)'}</h3>
            <div className="mb-3 p-3 rounded-lg border" style={{ backgroundColor: '#fef3c7', borderColor: '#fcd34d' }}>
              <p className="text-sm font-medium" style={{ color: '#92400e' }}>
                {zh ? '📹 视频指导：参与者将观看一段操作指导视频，演示如何记录日常照护活动。' : '📹 Video Instruction: Participants will be shown a video tutorial demonstrating how to log daily caregiving activities.'}
              </p>
            </div>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {zh 
                ? '完成筛选问卷后，主要照护者选择一个开始日期，进行为期七天的日常照护活动记录。应用程序从早上8点到晚上10点每小时发送提醒通知，提醒参与者记录该时段发生的照护相关活动。早上8点的提醒用于记录夜间发生的活动，晚上10点的提醒用于每小时记录以及回顾当天任何未及时记录的活动。由于痴呆症照护的繁重负担，记录并非强制要求在提醒时间完成——参与者可以在方便时随时添加记录。参与者还可以记录不限于特定时间的挑战、想法或需求。应用程序提供语音输入和AI辅助功能，帮助减轻照护者的记录负担，让他们可以通过语音录入或使用AI助手改进和润色回答。这种灵活且非强制的方式旨在更准确地反映参与者的实际需求，同时作为后续深度访谈（步骤3.8）的敏化准备过程。通过仪表板页面或"添加记录"按钮创建新记录，每条记录包含三个标签页：'
                : 'After completing screening questions, primary caregivers select a start date to begin seven days of daily caregiving activity logging. The app sends reminder notifications every hour from 8 AM to 10 PM, prompting participants to record care-related activities that occurred during that hour. The 8 AM reminder is for recording overnight activities, and the 10 PM reminder is for both hourly recording and reviewing any activities from the day that were not recorded earlier. Due to the heavy burden of dementia caregiving, entries are not strictly required to be filled at the time of the reminder—participants can add entries whenever they have time. Participants can also record challenges, thoughts, or needs that are not tied to any specific time. The app provides Voice Input and AI Support features to reduce the burden on caregivers, allowing them to record via voice or use the AI assistant to improve and refine their answers. This approach aims to capture participants\' actual needs while serving as a sensitizing process for the follow-up semi-structured interview (Step 3.8). Create entries through dashboard or "Add Entry" button. Each entry contains three tabs:'
              }
            </p>
            
            {/* Step 3.7.1: Hourly Momentary Log */}
            <h4 className="text-base font-bold mb-3 mt-4" style={{ color: 'var(--color-green)' }}>{zh ? '步骤 3.7.1：每小时瞬时记录' : 'Step 3.7.1: Hourly Momentary Log'}</h4>
            
            {/* Activity Tab */}
            <div className="mb-4 p-4 rounded-lg border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-primary)' }}>
              <h4 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-green)' }}>{zh ? '(1) 活动标签页' : '(1) Activity Tab'}</h4>
              <div className="space-y-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                
                <div className="p-3 rounded border" style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac' }}>
                  <strong style={{ color: 'var(--color-green)' }}>{zh ? '1. 发生时间（三种记录模式）' : '1. When did it happen? (Three Recording Modes)'}</strong>
                  <p className="text-xs mt-1 mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {zh ? '日常记录支持三种模式，允许参与者在方便时灵活记录：' : 'Daily logging supports three modes, allowing participants to record flexibly at their convenience:'}
                  </p>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-start gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium text-white shrink-0" style={{ backgroundColor: 'var(--color-green)' }}>{zh ? '现在' : 'Now'}</span>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{zh ? '记录正在发生或刚刚发生的照护活动' : 'Record care activities happening now or just occurred'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium shrink-0" style={{ backgroundColor: '#3B82F6', color: 'white' }}>{zh ? '其他时间' : 'Other Time'}</span>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{zh ? '补充白天未及时记录的活动——回顾研究期间发生但未记录的照护活动' : 'Supplement activities not recorded during the day—recall care activities that happened during the study but were not logged'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium shrink-0" style={{ backgroundColor: '#8B5CF6', color: 'white' }}>{zh ? '不限具体时间' : 'Not Tied to Specific Time'}</span>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{zh ? '记录不与特定事件挂钩的挑战、需求或想法——如：反复出现的困难、对工具/资源/服务的建议、一般性观察' : 'Record challenges, needs, or ideas NOT tied to specific events—e.g., recurring difficulties, suggestions for tools/resources/services, general observations'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-2 rounded" style={{ backgroundColor: '#f8fafc' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{zh ? '2. 活动类型（多选复选框）' : '2. Activity Category (Multi-select Checkboxes)'}</strong>
                  <p className="text-xs mt-1 mb-2" style={{ color: 'var(--text-secondary)' }}>{zh ? '选择此时段涉及的活动类型（可多选）' : 'Select activity types involved in this time period (multiple allowed)'}</p>
                  
                  {/* Actual checkbox list like in app */}
                  <div className="space-y-2 p-3 rounded-lg border text-xs" style={{ borderColor: '#e5e7eb', backgroundColor: '#f8fafc' }}>
                    <label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" className="rounded mt-0.5" defaultChecked readOnly /><span>{zh ? '临床护理: 给药、医疗任务（导尿管、伤口护理）' : 'Clinical: medication, medical tasks (catheter, wound care)'}</span></label>
                    <label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" className="rounded mt-0.5" defaultChecked readOnly /><span>{zh ? '功能性护理: 进食、洗澡、穿衣、梳洗、如厕、行走辅助' : 'Functional: feeding/eating, bathing, dressing, grooming, toileting, ambulation'}</span></label>
                    <label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" className="rounded mt-0.5" readOnly /><span>{zh ? '认知支持: 定向（时间、日期、人名、位置）、对话、回答问题、时事新闻' : 'Cognitive: orientation (time, day, names, location), conversation, answering questions, current events'}</span></label>
                    <label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" className="rounded mt-0.5" readOnly /><span>{zh ? '决策支持: 医疗决策、财务决策、非医疗决策' : 'Decision Making: medical decisions, financial decisions, non-medical decisions'}</span></label>
                    <label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" className="rounded mt-0.5" defaultChecked readOnly /><span>{zh ? '家务: 备餐、打扫房屋/庭院、购物、管理衣物' : 'Housekeeping: preparing meals, cleaning house/yard, shopping, managing wardrobe'}</span></label>
                    <label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" className="rounded mt-0.5" readOnly /><span>{zh ? '信息管理: 协调照护、与医护团队沟通、管理财务/账单' : 'Info Management: coordinating care, communicating with care team, managing finances/bills'}</span></label>
                    <label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" className="rounded mt-0.5" readOnly /><span>{zh ? '后勤安排: 预约安排、提醒、确保必需品送达（食物、用品）' : 'Logistics: scheduling appointments, reminding, ensuring delivery of necessities'}</span></label>
                    <label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" className="rounded mt-0.5" readOnly /><span>{zh ? '交通接送: 驾车、安排接送、陪同就医' : 'Transportation: driving, arranging rides, accompanying to appointments'}</span></label>
                    <label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" className="rounded mt-0.5" defaultChecked readOnly /><span>{zh ? '陪伴: 社交互动、聊天、游戏、音乐、散步、外出' : 'Companionship: social interaction, conversation, games, music, walks, outings'}</span></label>
                    <label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" className="rounded mt-0.5" readOnly /><span>{zh ? '照护者支持: 给其他照护者情感支持、替班/喘息服务' : 'Caregiver Support: emotional support for other caregivers, filling in/respite'}</span></label>
                    <label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" className="rounded mt-0.5" readOnly /><span>{zh ? '监护: 监督、安全监控、陪同散步/外出办事、防止走失' : 'Vigilance: supervision, safety monitoring, accompanying on walks/errands, preventing wandering'}</span></label>
                    <label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" className="rounded mt-0.5" readOnly /><span>{zh ? '宠物照顾: 遛宠物、喂食、看兽医、宠物管理' : 'Pet Care: walking pets, feeding, vet visits, pet management'}</span></label>
                    <label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" className="rounded mt-0.5" readOnly /><span>{zh ? '技能发展: 参加课程、阅读书籍、自我反思、学习失智症知识' : 'Skill Development: attending classes, reading books, self-reflection, learning about dementia'}</span></label>
                  </div>
                  <input type="text" className="w-full mt-2 p-2 rounded-lg border text-xs" style={{ borderColor: '#e5e7eb', backgroundColor: '#f8fafc' }} placeholder={zh ? '其他活动（请描述）...' : 'Other activity (please describe)...'} readOnly />
                </div>
                
                {/* Event-related Stress (7-point bipolar Likert scale) */}
                <div className="p-3 rounded border" style={{ backgroundColor: '#fef3c7', borderColor: '#fcd34d' }}>
                  <strong style={{ color: '#92400e' }}>{zh ? '3. 事件压力评估' : '3. Event Stress Rating'}</strong>
                  <p className="text-xs mt-1 mb-2" style={{ color: '#92400e' }}>{zh ? '请选择最能描述您对此事件感受的选项。' : 'What best describes your feeling about this event?'}</p>
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {[-3, -2, -1, 0, 1, 2, 3].map(n => (
                      <span key={n} className="px-3 py-1.5 rounded text-xs font-medium" style={{ backgroundColor: n === -1 ? '#f59e0b' : '#f3f4f6', color: n === -1 ? 'white' : '#6b7280' }}>
                        {n > 0 ? `+${n}` : n}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs mt-2" style={{ color: '#92400e' }}>
                    <span>{zh ? '-3 = 非常不愉快' : '-3 = Very Unpleasant'}</span>
                    <span>{zh ? '0 = 中立' : '0 = Neutral'}</span>
                    <span>{zh ? '+3 = 非常愉快' : '+3 = Very Pleasant'}</span>
                  </div>
                </div>
                
                <div className="p-2 rounded" style={{ backgroundColor: '#f8fafc' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{zh ? '4. 活动描述' : '4. Activity Description'}</strong>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{zh ? '描述您在这段时间内进行的护理活动。例如：协助洗澡、准备餐食、陪伴散步、管理药物等。' : 'Describe care activities you performed during this time. E.g. assisting with bathing, preparing meals, accompanying on walks, managing medications.'}</p>
                  <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{zh ? '如果您不想分别填写每个标签页，可以在此一次性描述所有内容：活动详情、参与人员（谁在帮助您、您希望谁能帮忙）、寻求帮助时遇到的挑战（沟通困难、协调问题）、您面临的困难（知识不足、时间压力、情绪压力）、以及您正在使用或希望拥有的资源和工具。' : 'If you prefer not to fill each tab separately, you can describe everything here at once: activity details, people involved (who helped, who you wish could help), challenges in reaching help (communication barriers, coordination issues), difficulties you face (lack of knowledge, time pressure, emotional stress), and resources you use or wish existed (apps, tools, support services).'}</p>
                  <div className="mt-2 relative">
                    <div className="w-full p-2 border rounded text-xs min-h-12" style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}>
                      <span style={{ color: '#999' }}>{zh ? '描述您的护理活动...' : 'Describe your care activities...'}</span>
                    </div>
                    <div className="absolute right-2 top-2 flex gap-1">
                      <span className="px-2 py-1 rounded text-xs flex items-center gap-1" style={{ backgroundColor: '#f3f4f6', color: '#666' }}><Mic className="w-3 h-3" /> {zh ? '语音输入' : 'Voice Input'}</span>
                      <span className="px-2 py-1 rounded text-xs text-white flex items-center gap-1" style={{ backgroundColor: 'var(--color-green)' }}><Sparkles className="w-3 h-3" /> {zh ? 'AI辅助' : 'AI Support'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Patient Memory/Behavioral Problems */}
                <div className="p-3 rounded border" style={{ backgroundColor: '#fef3c7', borderColor: '#fcd34d' }}>
                  <strong style={{ color: '#92400e' }}>{zh ? '5. 此次活动中，被照护者是否出现以下问题？' : '5. During this event, did your care recipient show any of the following?'}</strong>
                                    <div className="space-y-2 mt-2">
                    <div className="p-2 rounded" style={{ backgroundColor: 'white' }}>
                      <span className="text-xs" style={{ color: 'var(--text-primary)' }}>(a) {zh ? '记忆问题（如：重复说同样的事、丢失物品、无法完成任务、不记得事件或人、注意力不集中）' : 'Memory problems (e.g., repeating things, losing things, not completing a task, not remembering events or persons, concentration difficulties)'}</span>
                      <div className="flex gap-1 mt-1">
                        <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>{zh ? '否' : 'No'}</span>
                        <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: '#fcd34d', color: '#92400e' }}>{zh ? '是' : 'Yes'}</span>
                      </div>
                    </div>
                    <div className="p-2 rounded" style={{ backgroundColor: 'white' }}>
                      <span className="text-xs" style={{ color: 'var(--text-primary)' }}>(b) {zh ? '行为问题（如：故意破坏东西、言语攻击、威胁伤害他人、夜间游荡、对抗或挑衅）' : 'Behavior problems (e.g., breaking things on purpose, verbal aggression, threats to harm others, night wandering, opposition or provocation)'}</span>
                      <div className="flex gap-1 mt-1">
                        <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: '#fcd34d', color: '#92400e' }}>{zh ? '否' : 'No'}</span>
                        <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>{zh ? '是' : 'Yes'}</span>
                      </div>
                    </div>
                    <div className="p-2 rounded" style={{ backgroundColor: 'white' }}>
                      <span className="text-xs" style={{ color: 'var(--text-primary)' }}>(c) {zh ? '抑郁症状（如：悲伤、绝望、自残威胁、谈论死亡、感到孤独、无用或无价值）' : 'Depressive symptoms (e.g., sadness, hopelessness, threats of self-harm, speaking of dying, suffering from loneliness, uselessness or worthlessness)'}</span>
                      <div className="flex gap-1 mt-1">
                        <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>{zh ? '否' : 'No'}</span>
                        <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>{zh ? '是' : 'Yes'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Caregiver distress from memory/behavioral problems */}
                <div className="p-3 rounded border" style={{ backgroundColor: '#fef2f2', borderColor: '#fca5a5' }}>
                  <strong style={{ color: '#DC2626' }}>{zh ? '6. 此次活动中，被照护者的记忆/行为问题对您造成了多大困扰？' : '6. During this event, how much did their memory/behavioral problems disturb or upset you?'}</strong>
                                    <div className="flex gap-1 mt-2">
                    {[0, 1, 2, 3, 4].map(n => (
                      <span key={n} className="px-3 py-1 rounded text-xs" style={{ backgroundColor: n === 2 ? '#DC2626' : '#f3f4f6', color: n === 2 ? 'white' : '#6b7280' }}>
                        {n}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs mt-1" style={{ color: '#9ca3af' }}>
                    <span>{zh ? '0 = 完全没有' : '0 = Not at all'}</span>
                    <span>{zh ? '4 = 非常困扰' : '4 = Extremely'}</span>
                  </div>
                </div>
                
                <div className="p-2 rounded" style={{ backgroundColor: '#f8fafc' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{zh ? '7. 未能满足的护理需求（可选）' : '7. Unfulfilled Care Needs (Optional)'}</strong>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{zh ? '描述由于各种原因未能进行的护理活动。例如：缺乏知识、无人帮忙、资源不足、安全顾虑等。' : 'Describe care activities you couldn\'t do due to various reasons. E.g. lack of knowledge, no one available to help, insufficient resources, safety concerns.'}</p>
                  <div className="mt-2 relative">
                    <div className="w-full p-2 border rounded text-xs min-h-12" style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}>
                      <span style={{ color: '#999' }}>{zh ? '描述未能满足的护理需求...' : 'Describe unfulfilled care needs...'}</span>
                    </div>
                    <div className="absolute right-2 top-2 flex gap-1">
                      <span className="px-2 py-1 rounded text-xs flex items-center gap-1" style={{ backgroundColor: '#f3f4f6', color: '#666' }}><Mic className="w-3 h-3" /> {zh ? '语音输入' : 'Voice Input'}</span>
                      <span className="px-2 py-1 rounded text-xs text-white flex items-center gap-1" style={{ backgroundColor: 'var(--color-green)' }}><Sparkles className="w-3 h-3" /> AI</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-2 rounded" style={{ backgroundColor: '#f8fafc' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{zh ? '8. 想法或建议（可选）' : '8. Ideas or Suggestions (Optional)'}</strong>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{zh ? '描述您认为可能有帮助的资源、工具或服务。即使这段时间没有发生特别的事，也可记录想法。' : 'Describe resources, tools, or services you think might be helpful. Even if nothing particular happened, you can record your thoughts or ideas.'}</p>
                  <div className="mt-2 relative">
                    <div className="w-full p-2 border rounded text-xs min-h-12" style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}>
                      <span style={{ color: '#999' }}>{zh ? '描述您的资源想法...' : 'Describe your resource ideas...'}</span>
                    </div>
                    <div className="absolute right-2 top-2 flex gap-1">
                      <span className="px-2 py-1 rounded text-xs flex items-center gap-1" style={{ backgroundColor: '#f3f4f6', color: '#666' }}><Mic className="w-3 h-3" /> {zh ? '语音输入' : 'Voice Input'}</span>
                      <span className="px-2 py-1 rounded text-xs text-white flex items-center gap-1" style={{ backgroundColor: 'var(--color-green)' }}><Sparkles className="w-3 h-3" /> AI</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-2 rounded" style={{ backgroundColor: '#f8fafc' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{zh ? '9. 花费时间（分钟）' : '9. Time Spent (minutes)'}</strong>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{zh ? '估算您在这项活动上花费的时间（以分钟为单位）' : 'Estimate how much time you spent on this activity (in minutes)'}</p>
                  <input type="number" className="w-full mt-1 p-2 border rounded text-xs" style={{ borderColor: '#e5e7eb' }} placeholder="30" defaultValue="30" readOnly />
                </div>
                
                {/* Positive Affect - ESM items based on PANAS (Wichers et al., 2012) */}
                <div className="p-3 rounded" style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}>
                  <strong style={{ color: 'var(--color-green)' }}>{zh ? '10. 正向情绪 (Positive Affect)' : '10. Positive Affect'}</strong>
                  <p className="text-xs mt-1 mb-3" style={{ color: 'var(--text-secondary)' }}>{zh ? '此刻您的正向情绪程度如何？（1=完全没有 到 7=非常强烈）' : 'Rate your current positive feelings (1=Not at all to 7=Very much)'}</p>
                  <div className="space-y-2">
                    {[
                      { en: 'I feel cheerful', zh: '我感到高兴/愉快' },
                      { en: 'I feel relaxed', zh: '我感到放松' },
                      { en: 'I feel enthusiastic', zh: '我感到有热情/积极' },
                      { en: 'I feel satisfied', zh: '我感到满意' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2">
                        <span className="text-xs" style={{ color: '#1f2937' }}>{zh ? item.zh : item.en}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5, 6, 7].map(n => (
                            <span key={n} className="w-6 h-6 flex items-center justify-center rounded text-xs" style={{ backgroundColor: n === 4 ? 'var(--color-green)' : '#f3f4f6', color: n === 4 ? 'white' : '#6b7280' }}>{n}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Negative Affect - ESM items based on PANAS (Wichers et al., 2012) */}
                <div className="p-3 rounded" style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5' }}>
                  <strong style={{ color: '#DC2626' }}>{zh ? '11. 负向情绪 (Negative Affect)' : '11. Negative Affect'}</strong>
                  <p className="text-xs mt-1 mb-3" style={{ color: 'var(--text-secondary)' }}>{zh ? '此刻您的负向情绪程度如何？（1=完全没有 到 7=非常强烈）' : 'Rate your current negative feelings (1=Not at all to 7=Very much)'}</p>
                  <div className="space-y-2">
                    {[
                      { en: 'I feel insecure', zh: '我感到不安全/缺乏安全感' },
                      { en: 'I feel lonely', zh: '我感到孤独' },
                      { en: 'I feel anxious', zh: '我感到焦虑' },
                      { en: 'I feel irritated', zh: '我感到烦躁/恼怒' },
                      { en: 'I feel down', zh: '我感到低落/沮丧' },
                      { en: 'I feel desperate', zh: '我感到绝望' },
                      { en: 'I feel tensed', zh: '我感到紧张' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2">
                        <span className="text-xs" style={{ color: '#1f2937' }}>{zh ? item.zh : item.en}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5, 6, 7].map(n => (
                            <span key={n} className="w-6 h-6 flex items-center justify-center rounded text-xs" style={{ backgroundColor: n === 2 ? '#DC2626' : '#f3f4f6', color: n === 2 ? 'white' : '#6b7280' }}>{n}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Voice Input and AI Support Demo */}
            <div className="mb-4 p-4 rounded-lg border" style={{ borderColor: '#3B82F6', backgroundColor: 'var(--bg-primary)' }}>
              <h4 className="font-semibold text-sm mb-3" style={{ color: '#3B82F6' }}>{zh ? '语音输入和AI辅助功能' : 'Voice Input and AI Support Features'}</h4>
              <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                {zh ? '每个文本输入框都配备语音输入和AI辅助按钮，帮助减轻照护者的记录负担：' : 'Each text input field has Voice Input and AI Support buttons to reduce the recording burden on caregivers:'}
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                {/* Text field with buttons demo */}
                <div className="flex-1 p-3 rounded-lg border" style={{ borderColor: '#e5e7eb', backgroundColor: '#f8fafc' }}>
                  <div className="text-xs mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>{zh ? '活动描述' : 'Activity Description'}</div>
                  <div className="relative">
                    <div className="w-full p-2 border rounded-lg text-xs min-h-16 mb-2" style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}>
                      <span style={{ color: '#999' }}>{zh ? '描述您的照护活动...' : 'Describe your care activities...'}</span>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs" style={{ backgroundColor: '#f3f4f6', color: '#666' }}>
                        <Mic className="w-3 h-3" /> {zh ? '语音输入' : 'Voice Input'}
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: 'var(--color-green)' }}>
                        <Sparkles className="w-3 h-3" /> {zh ? 'AI辅助' : 'AI Support'}
                      </button>
                    </div>
                  </div>
                </div>
                {/* AI Support popup demo */}
                <div className="flex-1 p-3 rounded-lg border" style={{ borderColor: 'var(--color-green)', backgroundColor: 'white' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4" style={{ color: 'var(--color-green)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{zh ? 'AI问卷助手' : 'AI Survey Assistant'}</span>
                  </div>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {zh ? 'AI助手可以帮助您：' : 'The AI assistant can help you with:'}
                  </p>
                  <div className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <div>• {zh ? '解释问题 - 帮助理解问题的含义' : 'Explain Question - understand what the question is asking'}</div>
                    <div>• {zh ? '改进回答 - 使回答更清晰详细' : 'Improve - make your answer clearer and more detailed'}</div>
                    <div>• {zh ? '纠正错误 - 修正拼写和语法错误' : 'Correct - fix spelling and grammar mistakes'}</div>
                    <div>• {zh ? '扩展内容 - 添加更多细节和背景' : 'Elaborate - add more depth and context'}</div>
                    <div>• {zh ? '精简内容 - 使回答更简洁' : 'Shorten - make your answer more concise'}</div>
                    <div>• {zh ? '通用帮助 - 回答任何相关问题' : 'General Help - answer any related questions'}</div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    <span className="px-2 py-1 rounded text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '❓解释' : '❓Explain'}</span>
                    <span className="px-2 py-1 rounded text-xs border flex items-center gap-1" style={{ borderColor: '#e5e7eb' }}><Sparkles className="w-3 h-3" />{zh ? '改进' : 'Improve'}</span>
                    <span className="px-2 py-1 rounded text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '✓纠正' : '✓Correct'}</span>
                    <span className="px-2 py-1 rounded text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '📝扩展' : '📝Elaborate'}</span>
                    <span className="px-2 py-1 rounded text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '✂精简' : '✂Shorten'}</span>
                    <span className="px-2 py-1 rounded text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '💬帮助' : '💬Help'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* People Tab - Pixel Perfect */}
            <div className="mb-4 p-4 rounded-lg border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-primary)' }}>
              <h4 className="font-semibold text-sm mb-3" style={{ color: '#06B6D4' }}>{zh ? '(2) 人员标签页' : '(2) People Tab'}</h4>
              <div className="space-y-3 text-xs bg-white p-3 rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
                
                {/* Network Members Quick Select */}
                <div className="p-3 rounded-xl border" style={{ borderColor: '#e5e7eb', background: 'rgba(16,185,129,0.05)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ color: 'var(--color-green)' }}>👥</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{zh ? '从照护网络中选择' : 'Select from Care Network'}</span>
                    <button className="ml-auto text-xs px-2 py-1 rounded-lg text-white" style={{ backgroundColor: 'var(--color-green)' }}>+ {zh ? '添加更多' : 'Add More'}</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1" style={{ borderColor: '#6B7280', color: '#6B7280' }}>👤 {zh ? '仅自己' : 'Just Me'}</button>
                    <button className="px-3 py-1.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: '#EC4899' }}>{zh ? '老伴' : 'Wife'} ({zh ? '配偶' : 'Spouse'})</button>
                    <button className="px-3 py-1.5 rounded-full text-xs font-medium border" style={{ borderColor: '#8B5CF6', color: '#8B5CF6' }}>{zh ? '女儿' : 'Daughter'} ({zh ? '子女' : 'Child'})</button>
                    <button className="px-3 py-1.5 rounded-full text-xs font-medium border" style={{ borderColor: '#A78BFA', color: '#A78BFA' }}>{zh ? '儿子' : 'Son'} ({zh ? '子女' : 'Child'})</button>
                    <button className="px-3 py-1.5 rounded-full text-xs font-medium border" style={{ borderColor: '#84CC16', color: '#84CC16' }}>{zh ? '王阿姨' : 'Mrs. Wang'} ({zh ? '邻居' : 'Neighbor'})</button>
                  </div>
                </div>
                
                {/* People Involved */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{zh ? '参与人员' : 'People Involved'}</label>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{zh ? '描述此活动中涉及的人员：例如家人（配偶、子女）、医护人员（医生、护士、护工）、朋友、邻居等。他们提供了什么帮助？' : 'Describe who was involved: e.g. family (spouse, children), healthcare workers (doctor, nurse, aide), friends, neighbors. What help did they provide?'}</p>
                  <p className="text-xs mb-2" style={{ color: '#EF4444' }}>{zh ? '如果您不想分别填写每个问题，可以在此描述所有人员相关内容。' : 'If you prefer not to fill each question separately, you can describe all people-related content here.'}</p>
                  <div className="relative">
                    <textarea className="w-full p-3 pr-24 rounded-lg border text-xs" style={{ borderColor: '#e5e7eb', backgroundColor: '#f8fafc', minHeight: '60px' }} placeholder={zh ? '描述参与的人员...' : 'Describe people involved...'} readOnly></textarea>
                    <div className="absolute right-2 top-2 flex gap-1">
                      <button className="px-2 py-1.5 rounded-lg text-xs flex items-center gap-1" style={{ backgroundColor: '#f3f4f6', color: '#666' }}><Mic className="w-3 h-3" /> {zh ? '语音' : 'Voice'}</button>
                      <button className="px-2 py-1.5 rounded-lg text-xs text-white flex items-center gap-1" style={{ backgroundColor: 'var(--color-green)' }}><Sparkles className="w-3 h-3" /> AI</button>
                    </div>
                  </div>
                </div>
                
                {/* Who Else */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{zh ? '还希望谁能帮忙' : 'Who Else Do You Wish Could Help'}</label>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{zh ? '描述您希望能参与帮助但还没有参与的人。例如：其他家人、邻居、朋友、专业护理人员、志愿者、社工等。' : 'Describe people you wish could be involved but are not. E.g. other family members, neighbors, friends, professional caregivers, volunteers, social workers.'}</p>
                  <div className="relative">
                    <textarea className="w-full p-3 pr-24 rounded-lg border text-xs" style={{ borderColor: '#e5e7eb', backgroundColor: '#f8fafc', minHeight: '60px' }} placeholder={zh ? '描述您希望帮忙的人...' : 'Describe people you wish could help...'} readOnly></textarea>
                    <div className="absolute right-2 top-2 flex gap-1">
                      <button className="px-2 py-1.5 rounded-lg text-xs flex items-center gap-1" style={{ backgroundColor: '#f3f4f6', color: '#666' }}><Mic className="w-3 h-3" /> {zh ? '语音' : 'Voice'}</button>
                      <button className="px-2 py-1.5 rounded-lg text-xs text-white flex items-center gap-1" style={{ backgroundColor: 'var(--color-green)' }}><Sparkles className="w-3 h-3" /> AI</button>
                    </div>
                  </div>
                </div>
                
                {/* Challenges in Reaching */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{zh ? '联系希望帮忙的人时遇到的挑战' : 'Challenges in Reaching People You Wish Could Help'}</label>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{zh ? '描述您在联系或寻求帮助时遇到的困难。例如：不好意思开口、不知道如何解释护理需求、担心他们不懂如何照顾患者、担心解释病情需要太多时间、时间安排困难、联系不上他们等。' : 'Describe challenges in contacting or getting help. E.g. felt awkward asking, didn\'t know how to explain, worried they wouldn\'t know how to care, worried about time needed to explain the condition, scheduling conflicts, couldn\'t reach them.'}</p>
                  <div className="relative">
                    <textarea className="w-full p-3 pr-24 rounded-lg border text-xs" style={{ borderColor: '#e5e7eb', backgroundColor: '#f8fafc', minHeight: '60px' }} placeholder={zh ? '描述您遇到的挑战...' : 'Describe challenges you faced...'} readOnly></textarea>
                    <div className="absolute right-2 top-2 flex gap-1">
                      <button className="px-2 py-1.5 rounded-lg text-xs flex items-center gap-1" style={{ backgroundColor: '#f3f4f6', color: '#666' }}><Mic className="w-3 h-3" /> {zh ? '语音' : 'Voice'}</button>
                      <button className="px-2 py-1.5 rounded-lg text-xs text-white flex items-center gap-1" style={{ backgroundColor: 'var(--color-green)' }}><Sparkles className="w-3 h-3" /> AI</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Challenges & Resources Tab - Pixel Perfect */}
            <div className="mb-4 p-4 rounded-lg border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-primary)' }}>
              <h4 className="font-semibold text-sm mb-3" style={{ color: '#F59E0B' }}>{zh ? '(3) 挑战与资源标签页' : '(3) Challenges & Resources Tab'}</h4>
              <div className="space-y-4 text-xs bg-white p-3 rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
                
                {/* Task Difficulty Scale -3 to +3 (7-point bipolar) */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{zh ? '执行此任务时遇到的挑战' : 'Challenges in Undertaking This Task'}</label>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{zh ? '您在执行此任务时遇到了多少挑战？' : 'How much challenge did you encounter while performing this task?'}</p>
                  <div className="flex items-center gap-1 flex-wrap">
                    {[-3, -2, -1, 0, 1, 2, 3].map(n => (
                      <span key={n} className="px-3 py-1.5 rounded text-xs font-medium" style={{ backgroundColor: n === 0 ? 'var(--color-green)' : '#f3f4f6', color: n === 0 ? 'white' : '#6b7280' }}>
                        {n > 0 ? `+${n}` : n}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                    <span>{zh ? '-3 = 无挑战' : '-3 = No challenges'}</span>
                    <span>{zh ? '0 = 中等' : '0 = Moderate'}</span>
                    <span>{zh ? '+3 = 极大挑战' : '+3 = Extreme'}</span>
                  </div>
                </div>
                
                {/* Challenges Faced */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{zh ? '遇到的挑战' : 'Challenges Faced'}</label>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{zh ? '描述您遇到的困难。例如：不知如何应对症状、不了解患者的具体病情、时间不够、情感压力、协调困难等。' : 'Describe difficulties. E.g. not knowing how to handle symptoms, not understanding condition, time constraints, emotional stress, coordination difficulties.'}</p>
                  
                  {/* 11 Challenge Type Buttons */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <button className="px-2.5 py-1.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: 'var(--color-green)' }}>{zh ? '应对症状' : 'Handle symptoms'}</button>
                    <button className="px-2.5 py-1.5 rounded-full text-xs font-medium border" style={{ borderColor: '#e5e7eb' }}>{zh ? '病情' : 'Condition'}</button>
                    <button className="px-2.5 py-1.5 rounded-full text-xs font-medium border" style={{ borderColor: '#e5e7eb' }}>{zh ? '病情更新' : 'Updates'}</button>
                    <button className="px-2.5 py-1.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: 'var(--color-green)' }}>{zh ? '协调' : 'Coordination'}</button>
                    <button className="px-2.5 py-1.5 rounded-full text-xs font-medium border" style={{ borderColor: '#e5e7eb' }}>{zh ? '时间' : 'Time'}</button>
                    <button className="px-2.5 py-1.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: 'var(--color-green)' }}>{zh ? '情绪' : 'Emotional'}</button>
                    <button className="px-2.5 py-1.5 rounded-full text-xs font-medium border" style={{ borderColor: '#e5e7eb' }}>{zh ? '体力' : 'Physical'}</button>
                    <button className="px-2.5 py-1.5 rounded-full text-xs font-medium border" style={{ borderColor: '#e5e7eb' }}>{zh ? '沟通' : 'Communication'}</button>
                    <button className="px-2.5 py-1.5 rounded-full text-xs font-medium border" style={{ borderColor: '#e5e7eb' }}>{zh ? '安全' : 'Safety'}</button>
                    <button className="px-2.5 py-1.5 rounded-full text-xs font-medium border" style={{ borderColor: '#e5e7eb' }}>{zh ? '隐私' : 'Privacy'}</button>
                    <button className="px-2.5 py-1.5 rounded-full text-xs font-medium border" style={{ borderColor: '#e5e7eb' }}>{zh ? '其他' : 'Other'}</button>
                  </div>
                  
                  <p className="text-xs mb-2" style={{ color: '#EF4444' }}>{zh ? '如果您不想单独填写每个标签页，可以在此处描述所有挑战和资源需求。' : 'If you prefer not to fill each tab separately, you can describe all challenges and resource needs here.'}</p>
                  
                  <div className="relative">
                    <textarea className="w-full p-3 pr-24 rounded-lg border text-xs" style={{ borderColor: '#e5e7eb', backgroundColor: '#f8fafc', minHeight: '60px' }} placeholder={zh ? '详细描述您遇到的挑战...' : 'Describe your challenges in detail...'} readOnly></textarea>
                    <div className="absolute right-2 top-2 flex gap-1">
                      <button className="px-2 py-1.5 rounded-lg text-xs flex items-center gap-1" style={{ backgroundColor: '#f3f4f6', color: '#666' }}><Mic className="w-3 h-3" /> {zh ? '语音' : 'Voice'}</button>
                      <button className="px-2 py-1.5 rounded-lg text-xs text-white flex items-center gap-1" style={{ backgroundColor: 'var(--color-green)' }}><Sparkles className="w-3 h-3" /> AI</button>
                    </div>
                  </div>
                </div>
                
                {/* Resources Currently Using */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{zh ? '正在使用的资源及使用中的挑战' : 'Resources Currently Using & Challenges'}</label>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{zh ? '描述您目前使用的工具或资源，以及使用过程中遇到的挑战。例如：护理APP（界面复杂、数据输入繁琐）、提醒工具、信息网站、支持群组、家人帮助等。' : 'Describe tools/resources you use and challenges. E.g. care apps (complex interface, burden of input), reminder tools, info websites, support groups, family help.'}</p>
                  <div className="relative">
                    <textarea className="w-full p-3 pr-24 rounded-lg border text-xs" style={{ borderColor: '#e5e7eb', backgroundColor: '#f8fafc', minHeight: '60px' }} placeholder={zh ? '描述您使用的资源...' : 'Describe resources you use...'} readOnly></textarea>
                    <div className="absolute right-2 top-2 flex gap-1">
                      <button className="px-2 py-1.5 rounded-lg text-xs flex items-center gap-1" style={{ backgroundColor: '#f3f4f6', color: '#666' }}><Mic className="w-3 h-3" /> {zh ? '语音' : 'Voice'}</button>
                      <button className="px-2 py-1.5 rounded-lg text-xs text-white flex items-center gap-1" style={{ backgroundColor: 'var(--color-green)' }}><Sparkles className="w-3 h-3" /> AI</button>
                    </div>
                  </div>
                </div>
                
                {/* Resources You Wish Existed */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{zh ? '希望拥有或改进的资源' : 'Resources You Wish Existed or Improved'}</label>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{zh ? '描述您希望存在的工具，或现有工具的改进版本。例如：更好的护理协调APP、寻找帮手的平台、患者信息共享工具、获取专业建议的渠道等。' : 'Describe tools you wish existed, or improvements to current tools. E.g. better care coordination apps, platforms to find helpers, patient info sharing tools, channels for professional advice.'}</p>
                  <div className="relative">
                    <textarea className="w-full p-3 pr-24 rounded-lg border text-xs" style={{ borderColor: '#e5e7eb', backgroundColor: '#f8fafc', minHeight: '60px' }} placeholder={zh ? '描述您希望的资源...' : 'Describe resources you wish existed...'} readOnly></textarea>
                    <div className="absolute right-2 top-2 flex gap-1">
                      <button className="px-2 py-1.5 rounded-lg text-xs flex items-center gap-1" style={{ backgroundColor: '#f3f4f6', color: '#666' }}><Mic className="w-3 h-3" /> {zh ? '语音' : 'Voice'}</button>
                      <button className="px-2 py-1.5 rounded-lg text-xs text-white flex items-center gap-1" style={{ backgroundColor: 'var(--color-green)' }}><Sparkles className="w-3 h-3" /> AI</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3.7.2: End-of-Day Daily Logging */}
          <div className="mb-8 p-5 rounded-xl border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--color-green)' }}>{zh ? '步骤 3.7.2：每日结束记录' : 'Step 3.7.2: End-of-Day Daily Logging'}</h3>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {zh 
                ? '每天晚上10点，应用程序会发送提醒，邀请参与者完成当日的结束记录。此环节包括三个部分：(1) 补充当天未记录的小时活动；(2) 评估今日照护能力感；(3) 评估今日整体照护负担。'
                : 'At 10 PM each evening, the app sends a reminder inviting participants to complete their end-of-day logging. This includes three parts: (1) Supplement any hourly activities not recorded during the day; (2) Rate their daily sense of competence; (3) Rate their overall caregiving burden for today.'
              }
            </p>
            
            <div className="space-y-4">
              {/* Part 1: Supplement Hourly Logs */}
              <div className="p-4 rounded-lg border" style={{ borderColor: '#e5e7eb', backgroundColor: 'var(--bg-primary)' }}>
                <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--color-green)' }}>{zh ? '(1) 补充当日未记录的活动' : '(1) Supplement Hourly Logs Not Recorded'}</h4>
                <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                  {zh 
                    ? '回顾当天的照护活动，补充任何在整点提醒时未能记录的活动。使用"其他时间"模式添加。'
                    : 'Participants review their caregiving activities for the day and supplement any activities that were not recorded during hourly reminders. Use "Other Time" mode to add.'}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 rounded" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>{zh ? '其他时间' : 'Other Time'}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{zh ? '→ 添加未记录的活动' : '→ Add unrecorded activities'}</span>
                </div>
              </div>
              
              {/* Part 2: Daily Sense of Competence - ESM items from SSCQ */}
              <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-green)', backgroundColor: 'var(--bg-primary)' }}>
                <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--color-green)' }}>{zh ? '(2) 今日照护能力感' : '(2) Daily Sense of Competence'}</h4>
                <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                  {zh 
                    ? '以下问题来自照护能力感量表 (SSCQ) 的简化形式，用于评估参与者当天的照护能力感。'
                    : 'The following items are a shortened form of the Short Sense of Competence Questionnaire (SSCQ), used to assess participant\'s sense of competence for the day.'}
                </p>
                <div className="space-y-3 text-xs bg-white p-3 rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
                  <div className="p-2 rounded" style={{ backgroundColor: '#f8fafc' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>1. {zh ? '今天我因照护责任感到压力' : 'Today I felt stressed due to my care responsibilities'}</strong>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4, 5, 6, 7].map(n => (
                        <span key={n} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: n === 4 ? 'var(--color-green)' : '#f3f4f6', color: n === 4 ? 'white' : '#6b7280' }}>
                          {n}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs mt-1" style={{ color: '#9ca3af' }}>
                      <span>{zh ? '1 = 完全不同意' : '1 = Strongly Disagree'}</span>
                      <span>{zh ? '7 = 完全同意' : '7 = Strongly Agree'}</span>
                    </div>
                  </div>
                  
                  <div className="p-2 rounded" style={{ backgroundColor: '#f8fafc' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>2. {zh ? '今天我觉得与被照护者的相处没有给我足够的隐私空间' : 'Today I felt that the situation with my care recipient did not allow me as much privacy as I would have liked'}</strong>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4, 5, 6, 7].map(n => (
                        <span key={n} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: n === 4 ? 'var(--color-green)' : '#f3f4f6', color: n === 4 ? 'white' : '#6b7280' }}>
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-2 rounded" style={{ backgroundColor: '#f8fafc' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>3. {zh ? '今天我在与被照护者的互动中感到紧张' : 'Today I felt strained in the interactions with my care recipient'}</strong>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4, 5, 6, 7].map(n => (
                        <span key={n} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: n === 4 ? 'var(--color-green)' : '#f3f4f6', color: n === 4 ? 'white' : '#6b7280' }}>
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Part 3: Daily Burden Rating */}
              <div className="p-4 rounded-lg border" style={{ borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}>
                <h4 className="font-semibold text-sm mb-2" style={{ color: '#DC2626' }}>{zh ? '(3) 今日照护负担评估' : '(3) Daily Burden Rating'}</h4>
                <p className="text-xs mb-3" style={{ color: '#DC2626' }}>
                  {zh 
                    ? '回顾今天一整天，您会如何评价今天的整体照护负担？'
                    : 'Looking back at today as a whole, how would you rate your overall caregiving burden today?'}
                </p>
                <div className="flex items-center gap-1 flex-wrap">
                  {[-3, -2, -1, 0, 1, 2, 3].map(n => (
                    <span key={n} className="px-3 py-1.5 rounded text-xs font-medium" style={{ backgroundColor: n === 1 ? '#DC2626' : '#f3f4f6', color: n === 1 ? 'white' : '#6b7280' }}>
                      {n > 0 ? `+${n}` : n}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between text-xs mt-2" style={{ color: '#DC2626' }}>
                  <span>{zh ? '-3 = 非常轻松' : '-3 = Very Light'}</span>
                  <span>{zh ? '0 = 中等' : '0 = Moderate'}</span>
                  <span>{zh ? '+3 = 非常沉重' : '+3 = Very Heavy'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3.8 Interview */}
          <div className="mb-8 p-5 rounded-xl border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--color-green)' }}>{zh ? '步骤 3.8：参加半结构化访谈' : 'Step 3.8: Participate in Semi-Structured Interview'}</h3>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {zh 
                ? '完成七天记录后，研究团队将邀请选择参与访谈的参与者进行约60分钟的半结构化访谈。访谈可通过视频通话（Zoom、腾讯会议等）或面对面形式进行，全程录音（经参与者同意）。参与访谈将获得额外的感谢礼品。'
                : 'After completing week-long logging, the research team will invite participants who chose to participate in the interview to join an approximately 60-minute semi-structured interview. Interviews can be conducted via video call (Zoom, Tencent Meeting, etc.) or in person, with audio recording throughout (with the participants\' consent). Participants will receive compensation.'
              }
            </p>

            {/* Semi-structured Interview with Context Mapping - Written for RESEARCHERS */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{zh ? '半结构化访谈与情境映射' : 'Semi-Structured Interview with Context Mapping'}</h4>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                {zh 
                  ? '访谈采用半结构化访谈结合情境映射（Context Mapping）方法。访谈围绕预设的访谈问题进行，同时使用参与者七天调查生成的数字化情境映射（照护网络图和照护周记录）作为敏化（sensitizing）工具，帮助参与者回顾和反思其照护经历。敏化过程让参与者在访谈前通过可视化数据重新审视自己的照护活动、网络成员和挑战，从而在访谈中提供更丰富、更深入的回答。此外，研究人员使用情境映射工具引导参与者补充记录周期外或未被捕获的其他挑战和需求。'
                  : 'The interview employs a semi-structured interview combined with Context Mapping methodology. The interview is structured around preset interview questions, while using the digital context mapping generated from participants\' week-long survey (Care Network Graph and Caring Week Records) as a sensitizing tool to help participants review and reflect on their caregiving experiences. The sensitizing process allows participants to revisit their caregiving activities, network members, and challenges through visualized data before the interview, enabling detailed responses during the interview. Additionally, researchers use the context mapping tools to guide participants in supplementing challenges and needs that occurred outside the recording period or were not captured.'
                }
              </p>
              
              {/* Visualization Demo - The actual interview material */}
              <div className="bg-white rounded-xl border overflow-hidden mt-4" style={{ borderColor: '#e5e7eb' }}>
                {/* Tab Header */}
                <div className="flex border-b" style={{ borderColor: '#e5e7eb' }}>
                  <div className="flex-1 py-3 text-sm text-center" style={{ color: '#6B7280' }}>{zh ? '问题' : 'Questions'}</div>
                  <div className="flex-1 py-3 text-sm text-center font-medium border-b-2" style={{ borderColor: 'var(--color-green)', color: 'var(--color-green)' }}>{zh ? '我的照护网络 & 照护周' : 'My Care Network & My Caring Week'}</div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                  {/* Left: Care Network Graph - 6 members with clickable detail panel */}
                  <div className="border rounded-xl p-3" style={{ borderColor: '#e5e7eb', background: 'white' }}>
                    <div className="text-center mb-2">
                      <h4 className="font-bold text-sm" style={{ color: 'var(--color-green)' }}>{zh ? '我的照护网络' : 'My Care Network'}</h4>
                      <p className="text-xs" style={{ color: '#999' }}>{zh ? '点击成员查看详情' : 'Click member to view details'}</p>
                    </div>
                    
                    {/* Ecogram with 6 members - LARGER sizes */}
                    <div className="relative mx-auto" style={{ width: '320px', height: '280px' }}>
                      <div className="absolute inset-0 rounded-full border-2 border-dashed" style={{ borderColor: '#e0f2f1' }}></div>
                      <div className="absolute rounded-full border-2 border-dashed" style={{ top: '14%', left: '14%', width: '72%', height: '72%', borderColor: '#b2dfdb' }}></div>
                      <div className="absolute rounded-full border-2 border-dashed" style={{ top: '28%', left: '28%', width: '44%', height: '44%', borderColor: '#80cbc4' }}></div>
                      
                      <span className="absolute" style={{ top: '0%', left: '50%', transform: 'translateX(-50%)', color: '#9CA3AF', fontSize: '10px' }}>{zh ? '远: 偶尔支持' : 'Distant: sporadic support'}</span>
                      <span className="absolute" style={{ top: '16%', left: '4%', color: '#9CA3AF', fontSize: '10px' }}>{zh ? '中: 定期支持' : 'Medium: regular support'}</span>
                      <span className="absolute" style={{ top: '30%', left: '50%', transform: 'translateX(-50%)', color: '#9CA3AF', fontSize: '10px' }}>{zh ? '近: 必要支持' : 'Close: essential support'}</span>
                      
                      {/* Center - Primary Caregiver */}
                      <div className="absolute rounded-full flex items-center justify-center text-white font-bold shadow-md" style={{ top: '40%', left: '40%', width: '60px', height: '60px', backgroundColor: 'var(--color-green)', fontSize: '11px', textAlign: 'center', lineHeight: 1.2 }}>{zh ? '主要\n照护者' : 'Primary\nCaregiver'}</div>
                      
                      {/* Wife - Close circle */}
                      <div className="absolute rounded-full flex flex-col items-center justify-center text-white shadow-lg cursor-pointer hover:scale-105 transition-transform" style={{ top: '30%', left: '65%', width: '60px', height: '60px', backgroundColor: '#EC4899' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', lineHeight: 1.1 }}>{zh ? '老伴' : 'Wife'}</span>
                        <span style={{ fontSize: '10px', opacity: 0.9 }}>{zh ? '配偶' : 'Spouse'}</span>
                      </div>
                      
                      {/* Daughter - Close circle */}
                      <div className="absolute rounded-full flex flex-col items-center justify-center text-white shadow-lg cursor-pointer hover:scale-105 transition-transform" style={{ top: '55%', left: '22%', width: '56px', height: '56px', backgroundColor: '#8B5CF6' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', lineHeight: 1.1 }}>{zh ? '女儿' : 'Daughter'}</span>
                        <span style={{ fontSize: '9px', opacity: 0.9 }}>{zh ? '子女' : 'Child'}</span>
                      </div>
                      
                      {/* Son - Medium circle */}
                      <div className="absolute rounded-full flex flex-col items-center justify-center text-white shadow-lg cursor-pointer hover:scale-105 transition-transform" style={{ top: '14%', left: '28%', width: '52px', height: '52px', backgroundColor: '#A78BFA' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', lineHeight: 1.1 }}>{zh ? '儿子' : 'Son'}</span>
                        <span style={{ fontSize: '9px', opacity: 0.9 }}>{zh ? '子女' : 'Child'}</span>
                      </div>
                      
                      {/* Mrs. Wang - Medium circle */}
                      <div className="absolute rounded-full flex flex-col items-center justify-center text-white shadow-lg cursor-pointer hover:scale-105 transition-transform" style={{ top: '62%', left: '62%', width: '50px', height: '50px', backgroundColor: '#84CC16' }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', lineHeight: 1.1 }}>{zh ? '王阿姨' : 'Mrs.Wang'}</span>
                        <span style={{ fontSize: '8px', opacity: 0.9 }}>{zh ? '邻居' : 'Neighbor'}</span>
                      </div>
                      
                      {/* Dr. Li - Distant circle */}
                      <div className="absolute rounded-full flex flex-col items-center justify-center text-white shadow-lg cursor-pointer hover:scale-105 transition-transform" style={{ top: '2%', left: '66%', width: '48px', height: '48px', backgroundColor: '#EF4444' }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', lineHeight: 1.1 }}>{zh ? '李医生' : 'Dr. Li'}</span>
                        <span style={{ fontSize: '8px', opacity: 0.9 }}>{zh ? '医生' : 'Doctor'}</span>
                      </div>
                      
                      {/* Aide Zhang - Medium circle */}
                      <div className="absolute rounded-full flex flex-col items-center justify-center text-white shadow-lg cursor-pointer hover:scale-105 transition-transform" style={{ top: '72%', left: '8%', width: '52px', height: '52px', backgroundColor: '#A855F7' }}>
                        <span style={{ fontSize: '9px', fontWeight: 'bold', lineHeight: 1.1 }}>{zh ? '护工小张' : 'Aide'}</span>
                        <span style={{ fontSize: '8px', opacity: 0.9 }}>{zh ? '护工' : 'Zhang'}</span>
                      </div>
                      
                      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                        <line x1="50%" y1="50%" x2="75%" y2="40%" stroke="var(--color-green)" strokeWidth="2" />
                        <line x1="50%" y1="50%" x2="32%" y2="65%" stroke="var(--color-green)" strokeWidth="2" />
                        <line x1="50%" y1="50%" x2="38%" y2="25%" stroke="var(--color-green)" strokeWidth="1.5" strokeDasharray="4" />
                        <line x1="50%" y1="50%" x2="72%" y2="72%" stroke="var(--color-green)" strokeWidth="1.5" strokeDasharray="4" />
                        <line x1="50%" y1="50%" x2="78%" y2="15%" stroke="var(--color-green)" strokeWidth="1" strokeDasharray="2" />
                        <line x1="50%" y1="50%" x2="22%" y2="82%" stroke="var(--color-green)" strokeWidth="1.5" strokeDasharray="4" />
                      </svg>
                    </div>
                    
                    {/* Member Detail Panel - EXACT match to actual app */}
                    <div className="mt-3 rounded-xl border overflow-hidden" style={{ borderColor: '#e5e7eb', background: '#f9fafb' }}>
                      {/* Header with colored dot, name, Hide and Delete */}
                      <div className="flex justify-between items-center p-3 border-b" style={{ borderColor: '#e5e7eb', background: 'white' }}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: '#EC4899' }}></div>
                          <span className="font-medium" style={{ color: '#1F2937' }}>{zh ? '老伴' : 'Wife'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="px-2 py-1 rounded text-xs" style={{ background: '#f3f4f6', color: '#6B7280' }}>{zh ? '隐藏' : 'Hide'} ▲</button>
                          <button className="px-2 py-1 rounded text-xs" style={{ background: '#fee2e2', color: '#dc2626' }}>{zh ? '删除' : 'Delete'}</button>
                        </div>
                      </div>
                      
                      {/* Editable content */}
                      <div className="p-3 space-y-3">
                        {/* Tip message */}
                        <div className="p-2 rounded-lg text-xs" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-green)' }}>
                          {zh ? '提示：如果此网络成员已加入研究（有PO编号），可跳过这些问题。' : 'Tip: You can skip these questions if this network member has already joined the research (has a PO code).'}
                        </div>
                        
                        {/* Age & Gender */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: '#6B7280' }}>{zh ? '年龄:' : 'Age:'}</span>
                            <div className="w-12 px-2 py-1 rounded text-xs border text-center" style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}>65</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: '#6B7280' }}>{zh ? '性别:' : 'Gender:'}</span>
                            <div className="px-2 py-1 rounded text-xs border flex items-center gap-1" style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}>
                              <span>{zh ? '女' : 'F'}</span>
                              <span style={{ color: '#9ca3af', fontSize: '8px' }}>▼</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Relationship */}
                        <div>
                          <span className="text-xs block mb-1" style={{ color: '#6B7280' }}>{zh ? '关系类型' : 'Relationship'}</span>
                          <div className="px-3 py-2 rounded border text-sm" style={{ borderColor: '#e5e7eb', background: 'white' }}>{zh ? '配偶' : 'Spouse'}</div>
                        </div>
                        
                        {/* Support Direction - →me, me→, me↔ */}
                        <div className="grid grid-cols-3 gap-1">
                          <button className="py-1.5 px-2 rounded text-xs" style={{ background: '#f3f4f6', color: '#374151' }}>→me</button>
                          <button className="py-1.5 px-2 rounded text-xs" style={{ background: '#f3f4f6', color: '#374151' }}>me→</button>
                          <button className="py-1.5 px-2 rounded text-xs text-white" style={{ background: 'var(--color-green)' }}>me↔</button>
                        </div>
                        
                        {/* Distance */}
                        <div>
                          <span className="text-xs block mb-1" style={{ color: '#6B7280' }}>{zh ? '地理距离' : 'Distance'}</span>
                          <div className="grid grid-cols-3 gap-1">
                            <button className="py-1 rounded text-xs text-white" style={{ background: 'var(--color-green)' }}>{zh ? '同住' : 'Same home'}</button>
                            <button className="py-1 rounded text-xs" style={{ background: '#f3f4f6', color: '#374151' }}>{zh ? '同楼' : 'Same building'}</button>
                            <button className="py-1 rounded text-xs" style={{ background: '#f3f4f6', color: '#374151' }}>{zh ? '同小区' : 'Same neighborhood'}</button>
                            <button className="py-1 rounded text-xs" style={{ background: '#f3f4f6', color: '#374151' }}>{zh ? '同城' : 'Same city'}</button>
                            <button className="py-1 rounded text-xs" style={{ background: '#f3f4f6', color: '#374151' }}>{zh ? '不同城市' : 'Different city'}</button>
                            <button className="py-1 rounded text-xs" style={{ background: '#f3f4f6', color: '#374151' }}>{zh ? '不同省/国家' : 'Different province/country'}</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center gap-2 mt-3">
                      <button className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: 'var(--color-green)' }}>+ {zh ? '添加成员' : 'Add Member'}</button>
                      <button className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ backgroundColor: 'var(--color-green)' }}>{zh ? '保存' : 'Save'}</button>
                      <button className="px-3 py-1.5 rounded-lg text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '导出' : 'Export'}</button>
                    </div>
                  </div>
                  
                  {/* Right: My Caring Week - COMPREHENSIVE with all filters + 23 entries */}
                  <div className="border rounded-xl p-3" style={{ borderColor: '#e5e7eb', background: 'white' }}>
                    <div className="text-center mb-2">
                      <h4 className="font-bold text-sm" style={{ color: 'var(--color-green)' }}>{zh ? '我的照护周' : 'My Caring Week'}</h4>
                      <p className="text-xs" style={{ color: '#999' }}>23/23 {zh ? '条记录' : 'entries'}</p>
                    </div>
                    
                    {/* FILTER 1: Activity Type - All 13 categories */}
                    <div className="mb-2">
                      <div className="flex items-center gap-1 mb-1">
                        <span style={{ color: '#3B82F6', fontSize: '10px' }}>📊</span>
                        <span className="text-xs font-medium" style={{ color: '#6B7280' }}>{zh ? '活动类型' : 'Activity'}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-0.5 rounded-lg text-xs text-white" style={{ backgroundColor: 'var(--color-green)' }}>{zh ? '全部' : 'All'} (23)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs text-white" style={{ backgroundColor: '#3B82F6' }}>{zh ? '功能性' : 'Functional'} (5)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '临床' : 'Clinical'} (3)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '认知' : 'Cognitive'} (2)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '家务' : 'Housekeeping'} (4)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '决策' : 'Decision'} (1)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '信息' : 'Info Mgmt'} (2)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '后勤' : 'Logistics'} (1)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '交通' : 'Transport'} (1)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '陪伴' : 'Companion'} (2)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '照护者支持' : 'Caregiver'} (1)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#e5e7eb' }}>{zh ? '监护' : 'Vigilance'} (1)</span>
                      </div>
                    </div>
                    
                    {/* FILTER 2: People */}
                    <div className="mb-2">
                      <div className="flex items-center gap-1 mb-1">
                        <span style={{ color: '#06B6D4', fontSize: '10px' }}>👥</span>
                        <span className="text-xs font-medium" style={{ color: '#6B7280' }}>{zh ? '参与人员' : 'People'}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-0.5 rounded-lg text-xs text-white" style={{ backgroundColor: 'var(--color-green)' }}>{zh ? '全部' : 'All'} (23)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#6B7280', color: '#6B7280' }}>👤 {zh ? '仅自己' : 'Just Me'} (8)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#EC4899', color: '#EC4899' }}>{zh ? '老伴' : 'Wife'} (6)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#8B5CF6', color: '#8B5CF6' }}>{zh ? '女儿' : 'Daughter'} (4)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#A78BFA', color: '#A78BFA' }}>{zh ? '儿子' : 'Son'} (2)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#84CC16', color: '#84CC16' }}>{zh ? '王阿姨' : 'Mrs.Wang'} (1)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#EF4444', color: '#EF4444' }}>{zh ? '李医生' : 'Dr. Li'} (1)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#A855F7', color: '#A855F7' }}>{zh ? '护工' : 'Aide'} (1)</span>
                      </div>
                    </div>
                    
                    {/* FILTER 3: Time of Day */}
                    <div className="mb-2">
                      <div className="flex items-center gap-1 mb-1">
                        <span style={{ color: '#F59E0B', fontSize: '10px' }}>⏰</span>
                        <span className="text-xs font-medium" style={{ color: '#6B7280' }}>{zh ? '时间段' : 'Time of Day'}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-0.5 rounded-lg text-xs text-white" style={{ backgroundColor: 'var(--color-green)' }}>{zh ? '全部' : 'All'} (23)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#F59E0B' }}>🌅 {zh ? '早上' : 'Morning'} (7)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#F59E0B' }}>☀️ {zh ? '下午' : 'Afternoon'} (8)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#F59E0B' }}>🌆 {zh ? '傍晚' : 'Evening'} (5)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#F59E0B' }}>🌙 {zh ? '夜间' : 'Night'} (3)</span>
                      </div>
                    </div>
                    
                    {/* FILTER 4: Challenge Level - Interactive Slider */}
                    <div className="mb-2 p-2 rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span style={{ color: 'var(--color-green)', fontSize: '10px' }}>🔺</span>
                        <span className="text-xs font-medium" style={{ color: '#6B7280' }}>{zh ? '挑战等级' : 'Challenge Level'}</span>
                        <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--color-green)' }}>≥3</span>
                      </div>
                      <div className="relative">
                        <input type="range" min="0" max="5" defaultValue="3" className="w-full h-2 rounded-lg appearance-none cursor-pointer" style={{ background: 'linear-gradient(to right, var(--color-green) 60%, #e5e7eb 60%)', accentColor: 'var(--color-green)' }} />
                      </div>
                      <div className="flex justify-between text-xs mt-1" style={{ color: '#9CA3AF', fontSize: '9px' }}>
                        <span>{zh ? '全部' : 'All'}</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                      </div>
                    </div>
                    
                    {/* FILTER 5: Challenge Type - Actual types from app */}
                    <div className="mb-2">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs font-medium" style={{ color: '#EF4444' }}>{zh ? '挑战类型' : 'Challenge Type'}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-0.5 rounded-lg text-xs text-white" style={{ backgroundColor: 'var(--color-green)' }}>{zh ? '全部' : 'All'} (23)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#EF4444', color: '#EF4444' }}>{zh ? '应对症状' : 'Handle Symptoms'} (4)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#EF4444', color: '#EF4444' }}>{zh ? '了解病情' : 'Patient Condition'} (2)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#EF4444', color: '#EF4444' }}>{zh ? '病情更新' : 'Condition Updates'} (2)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#EF4444', color: '#EF4444' }}>{zh ? '协调困难' : 'Coordination'} (3)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#EF4444', color: '#EF4444' }}>{zh ? '时间不足' : 'Time Constraints'} (5)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#EF4444', color: '#EF4444' }}>{zh ? '情绪压力' : 'Emotional Stress'} (4)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#EF4444', color: '#EF4444' }}>{zh ? '体力要求' : 'Physical Demands'} (3)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#EF4444', color: '#EF4444' }}>{zh ? '沟通困难' : 'Communication'} (2)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#EF4444', color: '#EF4444' }}>{zh ? '安全/责任' : 'Safety/Liability'} (1)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#EF4444', color: '#EF4444' }}>{zh ? '隐私顾虑' : 'Privacy'} (1)</span>
                        <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#EF4444', color: '#EF4444' }}>{zh ? '其他' : 'Other'} (1)</span>
                      </div>
                    </div>
                    
                    {/* 23 Entry Cards - Scrollable */}
                    <div className="space-y-2 max-h-56 overflow-y-auto border-t pt-2" style={{ borderColor: '#e5e7eb' }}>
                      <div className="rounded-xl border-2 p-2" style={{ borderColor: '#e5e7eb' }}><div className="flex items-start gap-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#DC2626' }}>5</div><div className="flex-1 min-w-0"><p className="font-medium text-xs" style={{ color: '#1F2937' }}>{zh ? '帮妈妈洗澡，情绪激动一直抗拒...' : 'Helped mom bathe, very agitated and resistant...'}</p><div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#9CA3AF', fontSize: '9px' }}><span>📅 Nov 25</span><span>⏱️ 60m</span><span style={{ color: '#EC4899' }}>👥 {zh ? '老伴' : 'Wife'}</span></div><span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '8px' }}>{zh ? '功能性' : 'Functional'}</span></div></div></div>
                      <div className="rounded-xl border-2 p-2" style={{ borderColor: '#e5e7eb' }}><div className="flex items-start gap-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#DC2626' }}>4</div><div className="flex-1 min-w-0"><p className="font-medium text-xs" style={{ color: '#1F2937' }}>{zh ? '凌晨3点妈妈起床游走，担心跌倒...' : 'Mom wandered at 3am, worried about falls...'}</p><div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#9CA3AF', fontSize: '9px' }}><span>📅 Nov 24</span><span>⏱️ 120m</span><span>🌙</span></div><span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '8px' }}>{zh ? '监护' : 'Vigilance'}</span></div></div></div>
                      <div className="rounded-xl border-2 p-2" style={{ borderColor: '#e5e7eb' }}><div className="flex items-start gap-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#F59E0B' }}>3</div><div className="flex-1 min-w-0"><p className="font-medium text-xs" style={{ color: '#1F2937' }}>{zh ? '带妈妈去医院复查，排队等很久...' : 'Took mom to hospital checkup, long queue...'}</p><div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#9CA3AF', fontSize: '9px' }}><span>📅 Nov 25</span><span>⏱️ 180m</span><span style={{ color: '#EF4444' }}>👥 {zh ? '李医生' : 'Dr. Li'}</span></div><span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '8px' }}>{zh ? '临床' : 'Clinical'}</span></div></div></div>
                      <div className="rounded-xl border-2 p-2" style={{ borderColor: '#e5e7eb' }}><div className="flex items-start gap-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#F59E0B' }}>3</div><div className="flex-1 min-w-0"><p className="font-medium text-xs" style={{ color: '#1F2937' }}>{zh ? '准备午餐晚餐，考虑饮食禁忌和吞咽...' : 'Prepared meals, dietary restrictions, swallowing...'}</p><div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#9CA3AF', fontSize: '9px' }}><span>📅 Nov 25</span><span>⏱️ 90m</span></div><span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '8px' }}>{zh ? '家务' : 'Housekeeping'}</span></div></div></div>
                      <div className="rounded-xl border-2 p-2" style={{ borderColor: '#e5e7eb' }}><div className="flex items-start gap-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#10B981' }}>2</div><div className="flex-1 min-w-0"><p className="font-medium text-xs" style={{ color: '#1F2937' }}>{zh ? '陪妈妈公园散步，女儿也来了...' : 'Walked in park with mom, daughter joined...'}</p><div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#9CA3AF', fontSize: '9px' }}><span>📅 Nov 24</span><span>⏱️ 60m</span><span style={{ color: '#8B5CF6' }}>👥 {zh ? '女儿' : 'Daughter'}</span></div><span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '8px' }}>{zh ? '陪伴' : 'Companion'}</span></div></div></div>
                      <div className="rounded-xl border-2 p-2" style={{ borderColor: '#e5e7eb' }}><div className="flex items-start gap-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#DC2626' }}>4</div><div className="flex-1 min-w-0"><p className="font-medium text-xs" style={{ color: '#1F2937' }}>{zh ? '妈妈忘记吃药，联系医生咨询...' : 'Mom forgot medication, contacted doctor...'}</p><div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#9CA3AF', fontSize: '9px' }}><span>📅 Nov 23</span><span>⏱️ 30m</span></div><span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '8px' }}>{zh ? '临床' : 'Clinical'}</span></div></div></div>
                      <div className="rounded-xl border-2 p-2" style={{ borderColor: '#e5e7eb' }}><div className="flex items-start gap-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#F59E0B' }}>3</div><div className="flex-1 min-w-0"><p className="font-medium text-xs" style={{ color: '#1F2937' }}>{zh ? '和儿子视频，讨论护理安排费用...' : 'Video call with son, care arrangement costs...'}</p><div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#9CA3AF', fontSize: '9px' }}><span>📅 Nov 23</span><span>⏱️ 45m</span><span style={{ color: '#A78BFA' }}>👥 {zh ? '儿子' : 'Son'}</span></div><span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '8px' }}>{zh ? '决策' : 'Decision'}</span></div></div></div>
                      <div className="rounded-xl border-2 p-2" style={{ borderColor: '#e5e7eb' }}><div className="flex items-start gap-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#10B981' }}>2</div><div className="flex-1 min-w-0"><p className="font-medium text-xs" style={{ color: '#1F2937' }}>{zh ? '帮妈妈整理房间衣物，看老照片...' : 'Organized mom\'s room, looked at old photos...'}</p><div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#9CA3AF', fontSize: '9px' }}><span>📅 Nov 22</span><span>⏱️ 60m</span></div><span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '8px' }}>{zh ? '家务' : 'Housekeeping'}</span></div></div></div>
                      <div className="rounded-xl border-2 p-2" style={{ borderColor: '#e5e7eb' }}><div className="flex items-start gap-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#DC2626' }}>4</div><div className="flex-1 min-w-0"><p className="font-medium text-xs" style={{ color: '#1F2937' }}>{zh ? '妈妈情绪低落不愿说话，安慰很久...' : 'Mom depressed, refused to talk, comforted...'}</p><div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#9CA3AF', fontSize: '9px' }}><span>📅 Nov 22</span><span>⏱️ 90m</span><span style={{ color: '#EC4899' }}>👥 {zh ? '老伴' : 'Wife'}</span></div><span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '8px' }}>{zh ? '认知' : 'Cognitive'}</span></div></div></div>
                      <div className="rounded-xl border-2 p-2" style={{ borderColor: '#e5e7eb' }}><div className="flex items-start gap-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#F59E0B' }}>3</div><div className="flex-1 min-w-0"><p className="font-medium text-xs" style={{ color: '#1F2937' }}>{zh ? '护工小张来帮忙，交接情况注意事项...' : 'Aide Zhang came, handed over situation...'}</p><div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#9CA3AF', fontSize: '9px' }}><span>📅 Nov 21</span><span>⏱️ 30m</span><span style={{ color: '#A855F7' }}>👥 {zh ? '护工' : 'Aide'}</span></div><span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '8px' }}>{zh ? '信息' : 'Info Mgmt'}</span></div></div></div>
                      <div className="rounded-xl border-2 p-2" style={{ borderColor: '#e5e7eb' }}><div className="flex items-start gap-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#10B981' }}>1</div><div className="flex-1 min-w-0"><p className="font-medium text-xs" style={{ color: '#1F2937' }}>{zh ? '邻居王阿姨来探望，陪妈妈聊天...' : 'Neighbor Mrs. Wang visited, chatted with mom...'}</p><div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#9CA3AF', fontSize: '9px' }}><span>📅 Nov 21</span><span>⏱️ 45m</span><span style={{ color: '#84CC16' }}>👥 {zh ? '邻居' : 'Neighbor'}</span></div><span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '8px' }}>{zh ? '照护者支持' : 'Caregiver'}</span></div></div></div>
                      <div className="rounded-xl border-2 p-2" style={{ borderColor: '#e5e7eb' }}><div className="flex items-start gap-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#F59E0B' }}>3</div><div className="flex-1 min-w-0"><p className="font-medium text-xs" style={{ color: '#1F2937' }}>{zh ? '帮妈妈穿衣服，不太配合需要耐心...' : 'Helped mom dress, uncooperative, needed patience...'}</p><div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#9CA3AF', fontSize: '9px' }}><span>📅 Nov 21</span><span>⏱️ 40m</span><span>🌅</span></div><span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '8px' }}>{zh ? '功能性' : 'Functional'}</span></div></div></div>
                      <div className="rounded-xl border-2 p-2" style={{ borderColor: '#e5e7eb' }}><div className="flex items-start gap-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#DC2626' }}>5</div><div className="flex-1 min-w-0"><p className="font-medium text-xs" style={{ color: '#1F2937' }}>{zh ? '妈妈半夜喊叫说看到有人，安抚很久...' : 'Mom shouted at midnight, saw someone, calmed...'}</p><div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#9CA3AF', fontSize: '9px' }}><span>📅 Nov 20</span><span>⏱️ 90m</span><span>🌙</span></div><span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '8px' }}>{zh ? '认知' : 'Cognitive'}</span></div></div></div>
                      <div className="rounded-xl border-2 p-2" style={{ borderColor: '#e5e7eb' }}><div className="flex items-start gap-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#F59E0B' }}>3</div><div className="flex-1 min-w-0"><p className="font-medium text-xs" style={{ color: '#1F2937' }}>{zh ? '女儿来帮忙买菜打扫，减轻负担...' : 'Daughter helped with groceries, cleaning...'}</p><div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#9CA3AF', fontSize: '9px' }}><span>📅 Nov 20</span><span>⏱️ 120m</span><span style={{ color: '#8B5CF6' }}>👥 {zh ? '女儿' : 'Daughter'}</span></div><span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '8px' }}>{zh ? '家务' : 'Housekeeping'}</span></div></div></div>
                      <div className="rounded-xl border-2 p-2" style={{ borderColor: '#e5e7eb' }}><div className="flex items-start gap-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#10B981' }}>2</div><div className="flex-1 min-w-0"><p className="font-medium text-xs" style={{ color: '#1F2937' }}>{zh ? '给妈妈剪指甲梳头发，她很享受...' : 'Trimmed mom\'s nails, brushed hair, she enjoyed...'}</p><div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#9CA3AF', fontSize: '9px' }}><span>📅 Nov 20</span><span>⏱️ 30m</span></div><span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '8px' }}>{zh ? '功能性' : 'Functional'}</span></div></div></div>
                      <div className="rounded-xl border-2 p-2" style={{ borderColor: '#e5e7eb' }}><div className="flex items-start gap-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#F59E0B' }}>3</div><div className="flex-1 min-w-0"><p className="font-medium text-xs" style={{ color: '#1F2937' }}>{zh ? '开车带妈妈去女儿家吃饭...' : 'Drove mom to daughter\'s house for dinner...'}</p><div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#9CA3AF', fontSize: '9px' }}><span>📅 Nov 19</span><span>⏱️ 45m</span></div><span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '8px' }}>{zh ? '交通' : 'Transport'}</span></div></div></div>
                      <div className="rounded-xl border-2 p-2" style={{ borderColor: '#e5e7eb' }}><div className="flex items-start gap-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#DC2626' }}>4</div><div className="flex-1 min-w-0"><p className="font-medium text-xs" style={{ color: '#1F2937' }}>{zh ? '妈妈找不到东西很焦虑，帮她找了很久...' : 'Mom couldn\'t find things, anxious, searched long...'}</p><div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#9CA3AF', fontSize: '9px' }}><span>📅 Nov 19</span><span>⏱️ 60m</span></div><span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '8px' }}>{zh ? '功能性' : 'Functional'}</span></div></div></div>
                      <div className="rounded-xl border-2 p-2" style={{ borderColor: '#e5e7eb' }}><div className="flex items-start gap-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#F59E0B' }}>3</div><div className="flex-1 min-w-0"><p className="font-medium text-xs" style={{ color: '#1F2937' }}>{zh ? '整理妈妈的药物，确认剂量时间...' : 'Organized mom\'s medications, confirmed dosage timing...'}</p><div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#9CA3AF', fontSize: '9px' }}><span>📅 Nov 19</span><span>⏱️ 20m</span></div><span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '8px' }}>{zh ? '临床' : 'Clinical'}</span></div></div></div>
                      <div className="rounded-xl border-2 p-2" style={{ borderColor: '#e5e7eb' }}><div className="flex items-start gap-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#10B981' }}>2</div><div className="flex-1 min-w-0"><p className="font-medium text-xs" style={{ color: '#1F2937' }}>{zh ? '陪妈妈看电视，她喜欢的老剧...' : 'Watched TV with mom, her favorite old shows...'}</p><div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#9CA3AF', fontSize: '9px' }}><span>📅 Nov 19</span><span>⏱️ 90m</span></div><span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '8px' }}>{zh ? '陪伴' : 'Companion'}</span></div></div></div>
                      <div className="rounded-xl border-2 p-2" style={{ borderColor: '#e5e7eb' }}><div className="flex items-start gap-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#F59E0B' }}>3</div><div className="flex-1 min-w-0"><p className="font-medium text-xs" style={{ color: '#1F2937' }}>{zh ? '更新妈妈的病历记录，预约下次复诊...' : 'Updated mom\'s medical records, scheduled checkup...'}</p><div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#9CA3AF', fontSize: '9px' }}><span>📅 Nov 19</span><span>⏱️ 30m</span></div><span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '8px' }}>{zh ? '信息' : 'Info Mgmt'}</span></div></div></div>
                      <div className="rounded-xl border-2 p-2" style={{ borderColor: '#e5e7eb' }}><div className="flex items-start gap-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#F59E0B' }}>3</div><div className="flex-1 min-w-0"><p className="font-medium text-xs" style={{ color: '#1F2937' }}>{zh ? '采购妈妈的日用品和护理用品...' : 'Purchased daily supplies and care products for mom...'}</p><div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#9CA3AF', fontSize: '9px' }}><span>📅 Nov 19</span><span>⏱️ 60m</span></div><span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '8px' }}>{zh ? '后勤' : 'Logistics'}</span></div></div></div>
                      <div className="rounded-xl border-2 p-2" style={{ borderColor: '#e5e7eb' }}><div className="flex items-start gap-2"><div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#DC2626' }}>4</div><div className="flex-1 min-w-0"><p className="font-medium text-xs" style={{ color: '#1F2937' }}>{zh ? '喂妈妈吃饭，她不愿张嘴...' : 'Fed mom, she refused to open mouth...'}</p><div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#9CA3AF', fontSize: '9px' }}><span>📅 Nov 19</span><span>⏱️ 50m</span></div><span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', fontSize: '8px' }}>{zh ? '功能性' : 'Functional'}</span></div></div></div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-center mt-2 italic" style={{ color: 'var(--text-muted)' }}>{zh ? '图：情境映射可视化界面 - 照护网络图（左，6位成员）和照护周记录（右，23条记录，5类筛选器）' : 'Figure: Context Mapping Visualization Interface - Care Network Graph (left, 6 members) and Caring Week Records (right, 23 entries, 5 filter types)'}</p>
            </div>


            {/* Semi-Structured Interview Questions - PRIMARY CAREGIVER - 22 Questions from App */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{zh ? '主要照护者访谈问题（共22题）' : 'Primary Caregiver Interview Questions (22 total)'}</h4>
              <ol className="list-decimal list-inside space-y-3 text-sm p-4 rounded-lg border" style={{ color: 'var(--text-primary)', borderColor: '#e5e7eb', backgroundColor: '#f8fafc' }}>
                <li>{zh ? '您与患者是什么关系？您提供照护多长时间了？' : 'What is your relationship to the patient, and how long have you been providing care?'}</li>
                <li>{zh ? '患者目前的状况和主要照护需求是什么？' : 'What is the patient\'s current condition and main care needs?'}</li>
                <li>
                  {zh ? '您典型的一天照护是什么样的？' : 'What does a typical day of caregiving look like for you?'}
                  <span className="block mt-1 text-xs px-2 py-1 rounded italic" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-green)' }}>
                    {zh ? '"让我们一起看看您在「我的照护周」中记录的活动..."' : '"Let\'s look at your recorded activities in My Caring Week together..."'}
                  </span>
                </li>
                <li>
                  {zh ? '您在日常照护中遇到什么困难？' : 'What difficulties do you face in your daily caregiving?'}
                  <span className="block mt-1 text-xs px-2 py-1 rounded italic" style={{ background: 'rgba(239,68,68,0.1)', color: '#DC2626' }}>
                    {zh ? '"您记录了一些挑战。能具体说说吗？"' : '"You\'ve noted some challenges. Could you tell me more?"'}
                  </span>
                </li>
                <li>{zh ? '您需要他人提供什么支持来帮助照护患者？' : 'What support do you need from others to help care for the patient?'}</li>
                <li>
                  {zh ? '还有谁帮助照护患者？您与这些人的关系有多亲近？每个人做什么？' : 'Who else helps care for the patient? How close are you to these people, and what does each person do?'}
                  <span className="block mt-1 text-xs px-2 py-1 rounded italic" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-green)' }}>
                    {zh ? '"让我们看看您绘制的照护网络图。您能介绍一下这些人吗？"' : '"Let\'s look at the care network you\'ve mapped out. Could you walk me through who these people are?"'}
                  </span>
                </li>
                <li>{zh ? '在什么情况下您会向他人寻求支持？' : 'Under what circumstances do you ask others for support?'}</li>
                <li>{zh ? '您在寻求支持时遇到困难吗？有什么困难？' : 'Do you experience difficulties asking for support? What are the difficulties?'}</li>
                <li>{zh ? '有没有您可以请求帮助但还没有请求的人？是什么阻止了您？' : 'Is there anyone you could ask for help but haven\'t? What\'s stopping you?'}</li>
                <li>{zh ? '您的照护网络随时间有变化吗？' : 'Has your care network changed over time?'}</li>
                <li>{zh ? '您理想的照护网络会是什么样的？' : 'What would your ideal care network look like?'}</li>
                <li>{zh ? '看看您的网络，您对整体的满意度是多少（0-100分）？' : 'Looking at your network, how satisfied are you overall, from 0 to 100?'}</li>
                <li>{zh ? '当其他人帮助照护患者时，他们会问什么信息？您认为他们需要知道什么？' : 'When someone else helps care for the patient, what information do they ask for? What do you think they need to know?'}</li>
                <li>
                  {zh ? '您如何与其他照护者沟通？使用什么方法或技术？' : 'How do you communicate with other caregivers? What methods or technology do you use?'}
                  <span className="block mt-1 text-xs px-2 py-1 rounded italic" style={{ background: 'rgba(107,114,128,0.1)', color: '#4B5563' }}>
                    {zh ? '"您提到使用了一些工具。这些沟通方式效果如何？"' : '"You mentioned using certain tools. How well do these communication methods work for you?"'}
                  </span>
                </li>
                <li>{zh ? '您在与他人分享患者信息时是否遇到障碍？' : 'Are there barriers you face when sharing information about the patient with others?'}</li>
                <li>{zh ? '当患者状况变化时，您如何让其他人知道？是否有障碍？' : 'When the patient\'s condition changes, how do you keep others informed? Are there barriers?'}</li>
                <li>{zh ? '患者是否曾经走失、难以找到或拒绝回家？发生这种情况时您会向其他照护者求助吗？您如何协调，遇到什么障碍？' : 'Has the patient ever wandered, been difficult to find, or refused to return home? Do you ask other caregivers for help when this happens? How do you coordinate, and what barriers do you face?'}</li>
                <li>{zh ? '您对使用智能手机或电脑的熟悉程度如何？' : 'How familiar are you with using a smartphone or computer?'}</li>
                <li>{zh ? '您目前使用什么工具来了解更多关于失智症和照护的知识？当您面临不确定的情况时，您从哪里寻求信息或支持？您对目前使用的工具有什么障碍或顾虑？您希望有什么工具能更好地帮助您了解失智症和照护知识？什么功能会有帮助？' : 'What current tools do you use to learn more about dementia and caregiving? When you face uncertain situations, where do you seek information or support? What barriers or concerns do you have with the current tools you use? What tools do you wish existed to better help with learning about dementia and caregiving? What features would be helpful?'}</li>
                <li>{zh ? '您目前使用什么工具与其他照护者沟通或协调？什么有效，什么无效？您对目前使用的工具有什么障碍或顾虑？您希望有什么工具来帮助协调？什么功能会有帮助？' : 'What current tools do you use to communicate or coordinate with other caregivers? What has worked well, what has not? What barriers or concerns do you have with the current tools you use? What tools do you wish existed to help coordinate? What features would be helpful?'}</li>
                <li>{zh ? '如果您可以设计一个理想的数字服务来帮助照护工作，您希望它具备哪些功能？您会觉得哪些功能有用？您对使用数字工具有什么顾虑？' : 'If you could design an ideal digital service to help with caregiving, what features would you want it to have? What features would you find useful? What concerns do you have about using digital tools?'}</li>
                <li>{zh ? '关于您的经历，还有什么想分享的吗？' : 'Is there anything else you\'d like to share about your experience?'}</li>
              </ol>
            </div>

          </div>
        </section>

        {/* 4. Other Caregiver Procedures */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b" style={{ borderColor: 'var(--color-green)' }}>{zh ? '4. 其他照护者研究程序' : '4. Other Caregiver Study Procedures'}</h2>
          
          <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            {zh 
              ? '其他照护者通过主要照护者分享的邀请链接参与研究。与主要照护者相比，其他照护者无需填写照护对象状况评估或绘制照护网络，但需完成个人信息、痴呆症知识与态度问卷（ADKS和DAS）、以及七天日常记录。以下详细描述其他照护者的参与步骤。'
              : 'Other caregivers participate through the invitation link shared by the primary caregiver. Compared to primary caregivers, other caregivers do not need to fill in care recipient condition assessment or map care network, but need to complete personal information, dementia knowledge and attitude questionnaires (ADKS and DAS), and seven-day daily logging. The following describes in detail the participation steps for other caregivers.'
            }
          </p>
          
          {/* Other Caregiver Procedure Flowchart - GREEN ONLY, Full Section Names */}
          <div className="my-6 p-4 rounded-xl overflow-x-auto" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            {/* Row 1 */}
            <div className="flex items-center gap-2 min-w-max justify-center flex-wrap mb-3">
              <div className="px-3 py-2 rounded-lg text-center text-xs font-medium text-white" style={{ backgroundColor: 'var(--color-green)', minWidth: '200px' }}>
                <div>{zh ? '4.1 通过邀请链接访问并注册' : '4.1 Access via Invitation Link and Register'}</div>
              </div>
              <div style={{ color: 'var(--color-green)' }}>→</div>
              <div className="px-3 py-2 rounded-lg text-center text-xs font-medium text-white" style={{ backgroundColor: 'var(--color-green)', minWidth: '160px' }}>
                <div>{zh ? '4.2 填写个人基本信息' : '4.2 Fill in Personal Information'}</div>
              </div>
              <div style={{ color: 'var(--color-green)' }}>→</div>
              <div className="px-3 py-2 rounded-lg text-center text-xs font-medium text-white" style={{ backgroundColor: 'var(--color-green)', minWidth: '220px' }}>
                <div>{zh ? '4.3 完成痴呆症知识与态度问卷' : '4.3 Complete Dementia Knowledge & Attitudes Questionnaires'}</div>
              </div>
            </div>
            {/* Row 2 */}
            <div className="flex items-center gap-2 min-w-max justify-center flex-wrap">
              <div className="px-3 py-2 rounded-lg text-center text-xs font-medium border-2" style={{ borderColor: 'var(--color-green)', color: 'var(--color-green)', minWidth: '180px' }}>
                <div>{zh ? '4.4 周记录（日常照护活动）' : '4.4 Week-Long Logging (Daily Activities)'}</div>
              </div>
              <div style={{ color: 'var(--color-green)' }}>→</div>
              <div className="px-3 py-2 rounded-lg text-center text-xs font-medium border-2 border-dashed" style={{ borderColor: 'var(--color-green)', color: 'var(--color-green)', minWidth: '160px' }}>
                <div>{zh ? '4.5 参加半结构化访谈' : '4.5 Participate in Semi-Structured Interview'}</div>
                <div className="text-xs opacity-80">{zh ? '(可选)' : '(Optional)'}</div>
              </div>
            </div>
          </div>

          {/* Step 4.1 */}
          <div className="mb-8 p-5 rounded-xl border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--color-green)' }}>{zh ? '步骤 4.1：通过邀请链接访问并注册' : 'Step 4.1: Access via Invitation Link and Register'}</h3>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {zh 
                ? '其他照护者收到主要照护者通过微信、短信、邮件或其他方式分享的邀请链接后，点击链接即可访问注册页面。注册页面会显示邀请者（主要照护者）的信息，确认是被邀请参与该照护网络的研究。其他照护者同样需要阅读知情同意书，确认理解并同意后，填写邮箱地址和密码创建账户。系统将自动将该账户与主要照护者关联，标记为"其他照护者"角色。完成邮箱验证后即可登录使用应用程序。'
                : 'After receiving the invitation link shared by the primary caregiver via WeChat, SMS, email, or other methods, other caregivers can click the link to access the registration page. The registration page will display the inviter (primary caregiver) information, confirming they are invited to participate in this care network\'s study. Other caregivers also need to read the informed consent form, and after confirming understanding and agreement, fill in email address and password to create an account. The system will automatically link this account with the primary caregiver, marking it as "Other Caregiver" role. After email verification, they can log in to use the application.'
              }
            </p>
            <div className="bg-white rounded-xl border p-4 mx-auto" style={{ maxWidth: '320px', borderColor: '#e5e7eb' }}>
              <div className="bg-gray-100 px-3 py-1.5 -mx-4 -mt-4 mb-3 text-xs text-center font-medium border-b" style={{ color: '#666' }}>{zh ? '邀请注册页面' : 'Invitation Registration Page'}</div>
              <div className="text-center mb-3">
                <div className="text-sm font-medium mb-1" style={{ color: '#333' }}>{zh ? '您被邀请参与照护者调查' : 'You\'re Invited to Caregiver Survey'}</div>
                <p className="text-xs" style={{ color: '#666' }}>{zh ? '邀请人：张女士（主要照护者）' : 'Invited by: Ms. Zhang (Primary Caregiver)'}</p>
              </div>
              <div className="p-2 rounded mb-3" style={{ backgroundColor: '#f0fdf4' }}>
                <p className="text-xs text-center" style={{ color: 'var(--color-green)' }}>{zh ? '✓ 您将作为"其他照护者"参与此研究' : '✓ You will participate as "Other Caregiver"'}</p>
              </div>
              <button className="w-full py-2 rounded-lg text-white text-sm font-medium mb-2" style={{ backgroundColor: 'var(--color-green)' }}>{zh ? '接受邀请并注册' : 'Accept Invitation & Register'}</button>
            </div>
          </div>

          {/* Step 4.2 - Personal Information Only */}
          <div className="mb-8 p-5 rounded-xl border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--color-green)' }}>{zh ? '步骤 4.2：填写个人基本信息' : 'Step 4.2: Fill in Personal Information'}</h3>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {zh 
                ? '登录后，其他照护者进入"设置"页面填写个人信息。其他照护者需填写以下信息：(1) 年龄；(2) 性别；(3) 与主要照护者的关系；(4) 与被照护者的距离；(5) 联系频率。其他照护者无需填写照护对象状况评估（因为主要照护者已填写）、无需绘制照护网络。'
                : 'After logging in, other caregivers enter the "Settings" page to fill in personal information. Other caregivers need to fill in: (1) Age; (2) Gender; (3) Relationship to the primary caregiver; (4) Distance from care recipient; (5) Contact frequency. Other caregivers do not need to fill in care recipient condition assessment (since the primary caregiver has already completed it) or map care network.'
              }
            </p>
            <div className="bg-white rounded-xl border p-4 mx-auto" style={{ maxWidth: '300px', borderColor: '#e5e7eb' }}>
              <div className="bg-gray-100 px-3 py-1.5 -mx-4 -mt-4 mb-3 text-xs text-center font-medium border-b" style={{ color: '#666' }}>{zh ? '其他照护者 - 个人信息' : 'Other Caregiver - Personal Information'}</div>
              <div className="space-y-3">
                <div><label className="text-xs font-medium block mb-1">{zh ? '年龄' : 'Age'}</label><div className="w-full p-2 border rounded text-sm flex justify-between items-center" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}><span>35</span></div></div>
                <div><label className="text-xs font-medium block mb-1">{zh ? '性别' : 'Gender'}</label><div className="w-full p-2 border rounded text-sm flex justify-between items-center" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}><span>{zh ? '女' : 'Female'}</span><span style={{ color: '#9ca3af' }}>▼</span></div></div>
                <div><label className="text-xs font-medium block mb-1">{zh ? '与主要照护者的关系' : 'Relationship to Primary Caregiver'}</label><div className="w-full p-2 border rounded text-sm flex justify-between items-center" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}><span>{zh ? '子女' : 'Child'}</span><span style={{ color: '#9ca3af' }}>▼</span></div></div>
                <div><label className="text-xs font-medium block mb-1">{zh ? '与被照护者的距离' : 'Distance from Care Recipient'}</label><div className="w-full p-2 border rounded text-sm flex justify-between items-center" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}><span>{zh ? '同城' : 'Same City'}</span><span style={{ color: '#9ca3af' }}>▼</span></div></div>
                <div><label className="text-xs font-medium block mb-1">{zh ? '联系频率' : 'Contact Frequency'}</label><div className="w-full p-2 border rounded text-sm flex justify-between items-center" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}><span>{zh ? '每周' : 'Weekly'}</span><span style={{ color: '#9ca3af' }}>▼</span></div></div>
              </div>
              <p className="text-xs text-center mt-3 italic" style={{ color: '#999' }}>{zh ? '无需填写照护对象状况或网络' : 'No recipient condition or network needed'}</p>
            </div>
          </div>

          {/* Step 4.3 - ADKS + DAS Questionnaires */}
          <div className="mb-8 p-5 rounded-xl border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--color-green)' }}>{zh ? '步骤 4.3：完成痴呆症知识与态度问卷' : 'Step 4.3: Complete Dementia Knowledge and Attitudes Questionnaires'}</h3>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {zh 
                ? '在"设置"页面的"关于失智症的了解"部分，其他照护者需完成与主要照护者相同的两套标准化问卷：(1) 阿尔茨海默病知识量表（ADKS）：30道是非题，评估对痴呆症的了解程度；(2) 痴呆症态度量表（DAS）：20道李克特量表题，评估对痴呆症患者的态度。这些问卷有助于研究了解不同照护者对痴呆症的认知和态度差异。'
                : 'In the "Understanding Dementia" section of Settings, other caregivers complete the same two standardized questionnaires as primary caregivers: (1) Alzheimer\'s Disease Knowledge Scale (ADKS): 30 true/false items assessing knowledge about dementia; (2) Dementia Attitudes Scale (DAS): 20 Likert scale items assessing attitudes toward people with dementia. These questionnaires help the study understand differences in dementia knowledge and attitudes among different caregivers.'
              }
            </p>
            <div className="bg-white rounded-xl border p-4 mx-auto" style={{ maxWidth: '320px', borderColor: '#e5e7eb' }}>
              <div className="bg-gray-100 px-3 py-1.5 -mx-4 -mt-4 mb-3 text-xs text-center font-medium border-b" style={{ color: '#666' }}>{zh ? '痴呆症知识与态度问卷' : 'Dementia Knowledge & Attitudes'}</div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#f0fdf4' }}>
                  <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-green)' }}>ADKS</div>
                  <div className="text-xs" style={{ color: '#666' }}>{zh ? '阿尔茨海默病知识量表' : "Alzheimer's Disease Knowledge Scale"}</div>
                  <div className="text-xs mt-1">30 {zh ? '道是非题' : 'True/False items'}</div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#f0fdf4' }}>
                  <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-green)' }}>DAS</div>
                  <div className="text-xs" style={{ color: '#666' }}>{zh ? '痴呆症态度量表' : 'Dementia Attitudes Scale'}</div>
                  <div className="text-xs mt-1">20 {zh ? '道李克特量表题' : 'Likert scale items'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4.4 - Week-Long Logging */}
          <div className="mb-8 p-5 rounded-xl border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--color-green)' }}>{zh ? '步骤 4.4：周记录（日常照护活动）' : 'Step 4.4: Week-Long Logging (Daily Caregiving Activities)'}</h3>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {zh 
                ? '其他照护者在他们照护护理对象的日子里进行日常照护活动记录，为期七天。记录内容包含三个标签页：(1) 活动标签页：记录参与的照护活动类型、具体内容和时长；(2) 人员标签页：选择一起参与此活动的其他照护者（如果有），描述协作情况；(3) 挑战与资源标签页：记录遇到的挑战、情绪影响、使用的资源和期望的资源。其他照护者不需要填写日结照护能力感问题。通过收集其他照护者的数据，研究可以了解整个照护网络中不同成员的照护贡献、他们各自面临的挑战，以及主要照护者与其他照护者之间的协作模式。'
                : 'Other caregivers conduct daily caregiving activity logging on days they take care of the care recipient, for seven days. The recording content contains three tabs: (1) Activity tab: Record types of caregiving activities participated in, specific content, and duration; (2) People tab: Select other caregivers who participated in this activity together (if any), describe collaboration; (3) Challenges & Resources tab: Record challenges encountered, emotional impact, resources used, and resources desired. Other caregivers do not need to fill in the Daily Sense of Competence questions on End-of-Day Daily Logging. By collecting data from other caregivers, the study can understand caregiving contributions of different members in the entire care network, the challenges each faces, and collaboration patterns between primary and other caregivers.'
              }
            </p>
            <div className="bg-white rounded-xl border p-4 mx-auto" style={{ maxWidth: '300px', borderColor: '#e5e7eb' }}>
              <div className="bg-gray-100 px-3 py-1.5 -mx-4 -mt-4 mb-3 text-xs text-center font-medium border-b" style={{ color: '#666' }}>{zh ? '其他照护者 - 日常记录' : 'Other Caregiver - Daily Log'}</div>
              <div className="flex gap-1 mb-3"><div className="flex-1 py-1.5 rounded text-center text-xs text-white" style={{ backgroundColor: 'var(--color-green)' }}>{zh ? '活动' : 'Activity'}</div><div className="flex-1 py-1.5 rounded text-center text-xs bg-gray-100">{zh ? '人员' : 'People'}</div><div className="flex-1 py-1.5 rounded text-center text-xs bg-gray-100">{zh ? '挑战' : 'Challenges'}</div></div>
              <div className="mb-2"><div className="text-xs font-medium mb-1">{zh ? '交通接送' : 'Transportation'}</div><div className="flex gap-1"><span className="px-2 py-0.5 rounded text-xs text-white" style={{ backgroundColor: 'var(--color-green)' }}>{zh ? '接送就医' : 'Medical transport'}</span></div></div>
              <textarea className="w-full p-2 border rounded text-xs mb-2" rows={2} style={{ borderColor: '#e5e7eb' }} readOnly defaultValue={zh ? '今天开车送妈妈去医院做检查...' : 'Drove mom to hospital for checkup today...'}></textarea>
            </div>
          </div>

          {/* Step 4.5 Optional Interview */}
          <div className="mb-8 p-5 rounded-xl border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--color-green)' }}>{zh ? '步骤 4.5（可选）：参加半结构化访谈' : 'Step 4.5 (Optional): Participate in Semi-Structured Interview'}</h3>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {zh 
                ? '完成周记录后，研究团队将邀请参与者参加约60分钟的半结构化访谈。访谈可通过视频通话（Zoom、腾讯会议等）或面对面形式进行，全程录音（经参与者同意）。参与访谈将获得额外的感谢礼品。'
                : 'After completing week-long logging, the research team will invite participants to participate in an approximately 60-minute semi-structured interview. Interviews can be conducted via video call (Zoom, Tencent Meeting, etc.) or in person, with audio recording throughout (with participant consent). Participants will receive additional thank-you gifts.'
              }
            </p>
            
            {/* Context Mapping Approach */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{zh ? '半结构化访谈与情境映射' : 'Semi-Structured Interview with Context Mapping'}</h4>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                {zh 
                  ? '访谈采用半结构化访谈结合情境映射（Context Mapping）方法，与主要照护者访谈方法相同。访谈围绕预设的访谈问题进行，同时使用参与者周记录生成的数字化情境映射（照护周记录）作为敏化（sensitizing）工具，帮助参与者回顾和反思其照护经历。其他照护者访谈特别关注：作为支持性照护者的独特视角和经历、在照护网络中的角色定位、与主要照护者和其他成员的协调方式、平衡照护与个人生活的挣扎、以及对协作工具的需求。研究人员使用情境映射工具引导参与者补充记录周期外或未被捕获的其他挑战和需求。'
                  : 'The interview employs a semi-structured interview combined with Context Mapping methodology, same as the primary caregiver interview approach. The interview is structured around preset interview questions, while using the digital context mapping generated from participants\' week-long logging (Caring Week Records) as a sensitizing tool to help participants review and reflect on their caregiving experiences. Other caregiver interviews particularly focus on: unique perspectives and experiences as a supporting caregiver, role positioning in the care network, coordination with primary caregiver and other members, struggles balancing caregiving with personal life, and needs for collaboration tools. Researchers use the context mapping tools to guide participants in supplementing challenges and needs that occurred outside the recording period or were not captured.'
                }
              </p>
            </div>

            {/* Semi-Structured Interview Questions - OTHER CAREGIVER - 16 Questions from App */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{zh ? '网络成员访谈问题（共16题）' : 'Network Member Interview Questions (16 total)'}</h4>
              <ol className="list-decimal list-inside space-y-3 text-sm p-4 rounded-lg border" style={{ color: 'var(--text-primary)', borderColor: '#e5e7eb', backgroundColor: '#f8fafc' }}>
                <li>{zh ? '您与患者和主要照护者是什么关系？' : 'What is your relationship to the patient and the primary caregiver?'}</li>
                <li>{zh ? '您是如何开始参与照护的？' : 'How did you become involved in providing care?'}</li>
                <li>
                  {zh ? '您提供什么样的支持？多久一次？' : 'What kind of support do you provide? How often?'}
                  <span className="block mt-1 text-xs px-2 py-1 rounded italic" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-green)' }}>
                    {zh ? '"让我们看看您记录的活动..."' : '"Let\'s look at the activities you\'ve logged..."'}
                  </span>
                </li>
                <li>{zh ? '您提供的支持是否被接受、被需要、被感激？' : 'Is the support you provide accepted, needed, and appreciated?'}</li>
                <li>{zh ? '在您能够帮助之前，您需要了解患者的哪些信息？这些信息是如何传达给您的？当前的沟通方式是否存在障碍？' : 'What information do you need to know about the patient before you can help? How is this information communicated to you? Are there any barriers in how you currently receive this information?'}</li>
                <li>
                  {zh ? '您在提供支持时遇到困难吗？是什么让它变得困难？' : 'Do you experience difficulties when providing support? What makes it difficult?'}
                  <span className="block mt-1 text-xs px-2 py-1 rounded italic" style={{ background: 'rgba(239,68,68,0.1)', color: '#DC2626' }}>
                    {zh ? '"您记录了一些挑战。能具体说说吗？"' : '"You\'ve noted some challenges. Could you tell me more?"'}
                  </span>
                </li>
                <li>{zh ? '有没有您想帮忙但无法帮忙的时候？如果有，是什么阻止了您？' : 'Are there times you wanted to help but couldn\'t? If so, what stopped you?'}</li>
                <li>{zh ? '在照护患者期间，您如何与主要照护者和其他照护者沟通？当患者状况变化时，您是如何得知的？是否存在障碍？' : 'How do you communicate with the primary caregiver and other caregivers during caring for the patient? When the patient\'s condition changes, how do you find out? Are there barriers?'}</li>
                <li>{zh ? '您想提供更多还是更少的支持？如果您想提供更多，是什么阻止了您？' : 'Would you like to provide more or less support? If you would like to provide more, what is preventing you from doing so?'}</li>
                <li>{zh ? '患者是否曾经走失、难以找到或拒绝回家？您是否曾在这种情况下帮忙？您是如何帮助的？是否遇到了障碍？' : 'Has the patient ever wandered, been difficult to find, or refused to return home? Have you ever helped in such a situation? How did you help? Were there any barriers?'}</li>
                <li>{zh ? '什么能帮助您为患者和主要照护者提供更好的支持？' : 'What would help you provide better support to the patient and the primary caregiver?'}</li>
                <li>{zh ? '您对使用智能手机或电脑的熟悉程度如何？' : 'How familiar are you with using a smartphone or computer?'}</li>
                <li>{zh ? '您目前使用什么工具来了解更多关于失智症和照护的知识？当您面临不确定的情况时，您从哪里寻求信息或支持？您对目前使用的工具有什么障碍或顾虑？您希望有什么工具能更好地帮助您了解失智症和照护知识？什么功能会有帮助？' : 'What current tools do you use to learn more about dementia and caregiving? When you face uncertain situations, where do you seek information or support? What barriers or concerns do you have with the current tools you use? What tools do you wish existed to better help with learning about dementia and caregiving? What features would be helpful?'}</li>
                <li>{zh ? '您目前使用什么工具与其他照护者沟通或协调？什么有效，什么无效？您对目前使用的工具有什么障碍或顾虑？您希望有什么工具来帮助协调？什么功能会有帮助？' : 'What current tools do you use to communicate or coordinate with other caregivers? What has worked well, what has not? What barriers or concerns do you have with the current tools you use? What tools do you wish existed to help coordinate? What features would be helpful?'}</li>
                <li>{zh ? '如果您可以设计一个理想的数字服务来帮助照护工作，您希望它具备哪些功能？您会觉得哪些功能有用？您对使用数字工具有什么顾虑？' : 'If you could design an ideal digital service to help with caregiving, what features would you want it to have? What features would you find useful? What concerns do you have about using digital tools?'}</li>
                <li>{zh ? '关于您的经历，还有什么想分享的吗？' : 'Is there anything else you\'d like to share about your experience?'}</li>
              </ol>
            </div>
          </div>
        </section>

        {/* 5. Data Analysis */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b" style={{ borderColor: 'var(--color-green)' }}>{zh ? '5. 数据分析' : '5. Data Analysis'}</h2>
          <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
            {zh 
              ? '本研究采用混合方法分析框架，整合问卷调查、纵向日志记录及半结构化访谈数据。具体分析维度如下：'
              : 'This study employs a mixed-methods analytical framework, integrating data from questionnaire surveys, longitudinal diary entries, and semi-structured interviews. The specific analytical dimensions are as follows:'
            }
          </p>
          <div className="space-y-4">
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{zh ? '5.1 照护网络结构与模式分析' : '5.1 Care Network Structure and Pattern Analysis'}</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{zh ? '基于照护网络图谱和七天活动日志数据，分析痴呆症家庭照护网络的拓扑结构特征，包括：网络规模与组成、不同关系类型照护者的角色分布、照护责任在网络成员间的分配模式、网络中的核心节点与潜在脆弱点识别、照护活动的类型分布、不同活动类型对照护者情绪状态的差异性影响、以及主要照护者与其他照护者在活动类型上的分工差异。' : 'Based on care network mapping and seven-day activity diary data, this analysis examines the topological characteristics of dementia family care networks, including: network size and composition, role distribution among caregivers of different relationship types, patterns of caregiving responsibility allocation across network members, identification of core nodes and potential vulnerabilities within the network, type distribution of caregiving activities, differential emotional impacts of various activity types on caregivers, and differences in activity type distribution between primary and other caregivers.'}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{zh ? '5.2 痴呆症知识与态度评估' : '5.2 Dementia Knowledge and Attitude Assessment'}</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{zh ? '采用阿尔茨海默病知识量表（ADKS）和痴呆症态度量表（DAS）的标准化评分，评估照护者的痴呆症疾病知识水平及知识薄弱领域、照护者对痴呆症患者的态度特征、以及知识水平与照护行为模式之间的相关性。' : 'Using standardized scoring from the Alzheimer\'s Disease Knowledge Scale (ADKS) and Dementia Attitudes Scale (DAS), this analysis assesses caregivers\' dementia knowledge levels and knowledge gaps, attitudinal characteristics toward persons with dementia, and correlations between knowledge levels and caregiving behavior patterns.'}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{zh ? '5.3 照护挑战与支持需求分析' : '5.3 Caregiving Challenges and Support Needs Analysis'}</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{zh ? '整合定量日志记录与定性访谈数据，识别照护者最常面临的挑战类型及其情境特征、现有应对资源与工具的使用现状、以及照护者表达的未满足支持需求。分析结果将为后续干预设计提供实证依据。' : 'Integrating quantitative diary records with qualitative interview data, this analysis identifies the most prevalent challenge types faced by caregivers and their contextual characteristics, current utilization of coping resources and tools, and unmet support needs expressed by caregivers. Findings will provide empirical evidence for subsequent intervention design.'}</p>
            </div>
          </div>
        </section>

        {/* References */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b" style={{ borderColor: 'var(--color-green)' }}>{zh ? '参考文献' : 'References'}</h2>
          <div className="text-sm space-y-2" style={{ color: 'var(--text-secondary)' }}>
            <p>Carpenter, B. D., Balsis, S., Otilingam, P. G., Hanson, P. K., & Gatz, M. (2009). The Alzheimer's Disease Knowledge Scale: Development and psychometric properties. <i>The Gerontologist, 49</i>(2), 236-247.</p>
            <p>Kraijo, H., Brouwer, W., de Leeuw, R., Schrijvers, G., & van Exel, J. (2014). The perseverance time of informal carers of dementia patients: Validation of a new measure to initiate transition of care at home to nursing home care. <i>Journal of Alzheimer's Disease, 40</i>(3), 631-642. doi: 10.3233/JAD-132420</p>
            <p>Kraijo, H., Brouwer, W., de Leeuw, R., Schrijvers, G., & van Exel, J. (2017). Perseverance time of informal caregivers for people with dementia: Construct validity, responsiveness and predictive validity. <i>Alzheimer's Research & Therapy, 9</i>(1), 26. doi: 10.1186/s13195-017-0251-0</p>
            <p>O'Connor, M. L., & McFadden, S. H. (2010). Development and psychometric validation of the Dementia Attitudes Scale. <i>International Journal of Alzheimer's Disease, 2010</i>, 454218.</p>
            <p>Ponnala, S., Block, L., Engel, L., Zeng, X., Lakhmani, P., Gibbons, M. C., & Werner, N. E. (2020). Conceptualizing Caregiving Activities for Persons with Dementia through a Patient Work Lens. <i>AMIA Annual Symposium Proceedings</i>. PMC7098392. [Activity categorization framework used in this study]</p>
            <p>Vernooij-Dassen, M. J., Felling, A. J., Brummelkamp, E., Dauzenberg, M. G., van den Bos, G. A., & Grol, R. (1999). Assessment of caregiver's competence in dealing with the burden of caregiving for a dementia patient: A Short Sense of Competence Questionnaire (SSCQ) suitable for clinical practice. <i>Journal of the American Geriatrics Society, 47</i>(2), 256-257.</p>
            <p>de Vugt, M. E., Nicolson, N. A., Aalten, P., Lousberg, R., Jolle, J., & Verhey, F. R. J. (2005). Behavioral problems in dementia patients and salivary cortisol patterns in caregivers. <i>Journal of Neuropsychiatry and Clinical Neurosciences, 17</i>(2), 201-207. [Daily Sense of Competence ESM items]</p>
            <p>Morris, J. C. (1993). The Clinical Dementia Rating (CDR): Current version and scoring rules. <i>Neurology, 43</i>(11), 2412-2414.</p>
          </div>
        </section>
      </article>
    </div>
  );
}
