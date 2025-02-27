import React, { useState, useEffect } from 'react';
import { 
  addJob as firebaseAddJob, 
  getUserJobs, 
  updateJob as firebaseUpdateJob, 
  deleteJob as firebaseDeleteJob 
} from '../services/jobService';

const JobApplicationTracker = () => {
  // Initial sample data
  const initialJobs = [
    { 
      id: 1, 
      company: 'Tech Solutions Inc.', 
      position: 'Frontend Developer', 
      dateApplied: '2025-02-15', 
      status: 'Interview', 
      priority: 'High',
      notes: 'Second interview scheduled for March 5th',
      interviews: [
        { 
          date: '2025-02-25', 
          type: 'Technical',
          notes: 'Was asked about React hooks, state management, and CSS grid. Struggled with system design question.',
          strengths: 'Explained React concepts clearly, showed portfolio effectively',
          improvements: 'Need to practice system design questions and whiteboarding',
          rating: 7
        }
      ]
    },
    { 
      id: 2, 
      company: 'Data Analytics Co.', 
      position: 'Data Scientist', 
      dateApplied: '2025-02-10', 
      status: 'Applied', 
      priority: 'Medium',
      notes: 'Submitted portfolio with application',
      interviews: [] 
    },
    { 
      id: 3, 
      company: 'Startup Ventures', 
      position: 'Product Manager', 
      dateApplied: '2025-01-28', 
      status: 'Offer', 
      priority: 'High',
      notes: '$85K, benefits pending, must respond by March 15th',
      interviews: [
        {
          date: '2025-02-05',
          type: 'Behavioral',
          notes: 'Spoke with potential manager and team. Asked about product development process and user research methods.',
          strengths: 'Connected well with the team, discussed past projects effectively',
          improvements: 'Could have asked more questions about company culture',
          rating: 8
        },
        {
          date: '2025-02-15',
          type: 'Case Study',
          notes: 'Presented solution for improving user onboarding flow. Panel of 3 senior PMs.',
          strengths: 'Data-driven approach, clear presentation style',
          improvements: 'Could have addressed monetization strategy more deeply',
          rating: 9
        }
      ]
    }
  ];

  // State management
  const [jobs, setJobs] = useState(initialJobs);
  const [newJob, setNewJob] = useState({
    id: null,
    company: '',
    position: '',
    dateApplied: '',
    status: 'Applied',
    priority: 'Medium',
    notes: '',
    interviews: []
  });
  const [editing, setEditing] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('All');
  const [view, setView] = useState('cards');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
  const [newInterview, setNewInterview] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: 'Behavioral',
    notes: '',
    strengths: '',
    improvements: '',
    rating: 5
  });
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState({});
  const [theme, setTheme] = useState('default');
  const [user, setUser] = useState(null);

  // Status options
  const statusOptions = ['Applied', 'Rejected', 'Phone Screen', 'Interview', 'Final Round', 'Offer', 'Accepted', 'Declined'];
  const priorityOptions = ['Low', 'Medium', 'High'];
  const interviewTypes = ['Behavioral', 'Technical', 'Case Study', 'Panel', 'Phone Screen', 'Onsite', 'Final Round'];

  // ユーザー管理
  useEffect(() => {
    const mockUser = { 
      uid: 'dummy-user-id',
      email: 'user@example.com'
    };
    setUser(mockUser);
  }, []);

  // データ取得
  useEffect(() => {
    const fetchJobs = async () => {
      if (user) {
        try {
          const userJobs = await getUserJobs(user.uid);
          setJobs(userJobs);
        } catch (error) {
          console.error("Failed to fetch jobs:", error);
        }
      }
    };
    fetchJobs();
  }, [user]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewJob({ ...newJob, [name]: value });
  };

  const handleInterviewInputChange = (e) => {
    const { name, value } = e.target;
    setNewInterview({ ...newInterview, [name]: value });
  };

// addJob 関数の修正
  const addJob = async () => {
        if (!newJob.company || !newJob.position) return;
        
        const job = {
        ...newJob,
        id: editing ? newJob.id : Date.now(),
        dateApplied: newJob.dateApplied || new Date().toISOString().slice(0, 10),
        interviews: newJob.interviews || []
        };
        
        try {
        if (editing) {
            // 既存のジョブを更新
            console.log('Updating existing job with ID:', job.id);
            const updatedJob = await firebaseUpdateJob(job.id, job);
            
            setJobs(prevJobs => prevJobs.map(j => j.id === job.id ? { ...j, ...updatedJob } : j));
            setEditing(false);
        } else {
            // 新しいジョブを追加
            if (user) {
            console.log('Adding new job for user:', user.uid);
            const newJobData = await firebaseAddJob(user.uid, job);
            
            console.log('Job added successfully:', newJobData);
            
            // 新しいジョブをUIに追加 (Firestoreから返されたIDを使用)
            setJobs(prevJobs => [
                { ...job, id: newJobData.id }, 
                ...prevJobs
            ]);
            }
        }
        
        // フォームをリセット
        setNewJob({
            id: null,
            company: '',
            position: '',
            dateApplied: '',
            status: 'Applied',
            priority: 'Medium',
            notes: '',
            interviews: []
        });
        } catch (error) {
        console.error("Failed to save job:", error);
        // ここでエラーメッセージをユーザーに表示するロジックを追加できます
        }
  };
 
  // deleteJob 関数の修正
  const deleteJob = async (id) => {
    console.log('Attempting to delete job with ID:', id);
    
    if (!user) {
      console.warn('No user found, cannot delete job');
      return;
    }
    
    try {
      // Firestoreのジョブを削除 (IDは文字列として扱う)
      await firebaseDeleteJob(id.toString());
      console.log('Job deleted from Firestore');
      
      // UIからも削除
      setJobs(prevJobs => prevJobs.filter(job => job.id !== id));
      
      // 選択されたジョブが削除されたジョブと同じなら、選択を解除
      if (selectedJob && selectedJob.id === id) {
        setSelectedJob(null);
        setShowJobDetailsModal(false);
      }
    } catch (error) {
      console.error("Failed to delete job:", error);
    }
  };
  
  // addInterview 関数の修正
  const addInterview = async () => {
    if (!selectedJob) return;
    
    const updatedJob = {
      ...selectedJob,
      interviews: [...selectedJob.interviews, newInterview]
    };
    
    try {
      // Firestoreのジョブを更新
      await firebaseUpdateJob(selectedJob.id.toString(), updatedJob);
      console.log('Interview added to job in Firestore');
      
      // ローカルの状態を更新
      setJobs(prevJobs => prevJobs.map(job => job.id === selectedJob.id ? updatedJob : job));
      setSelectedJob(updatedJob);
      
      // フォームをリセット
      setShowInterviewForm(false);
      setNewInterview({
        date: new Date().toISOString().slice(0, 10),
        type: 'Behavioral',
        notes: '',
        strengths: '',
        improvements: '',
        rating: 5
      });
    } catch (error) {
      console.error("Failed to add interview:", error);
    }
  };
  
  // editJob 関数の修正
  const editJob = (job) => {
    console.log('editJob called with:', job);
    setEditing(true);
    setNewJob({ ...job });
    
    // この部分は削除または修正
    // 編集中のジョブを直ちに更新するロジックは不要
    // ユーザーが編集して「更新」ボタンをクリックしたときに更新するべき
    
    // 以下のコードは削除し、addJob関数で対応するようにします
    /*
    if (job.id) {
      const updatedJob = {
        ...job,
        status: job.status,
        priority: job.priority
      };
      console.log('Preparing to update job:', updatedJob);
      handleUpdateJob(job.id, updatedJob);
    }
    */
  };

  const viewJobDetails = (job) => {
    setSelectedJob(job);
    setShowJobDetailsModal(true);
  };

  const generateAIAnalysis = () => {
    if (!selectedJob || selectedJob.interviews.length === 0) {
      setAiAnalysis({
        overallScore: 0,
        interviewCount: 0,
        averageRating: '0.0',
        topStrengths: ["No interview data available"],
        topImprovements: ["No interview data available"],
        recommendations: ["Add interview experiences to get AI-powered insights"],
        successRate: {
          applied: jobs.length,
          interviews: 0,
          offers: 0
        },
        conversionRate: 0,
        offerRate: 0
      });
      setShowAnalysisModal(true);
      return;
    }
    
    // Simulate AI analysis based on interview data
    const interviewCount = selectedJob.interviews.length;
    const averageRating = selectedJob.interviews.reduce((acc, interview) => acc + interview.rating, 0) / interviewCount;
    const allStrengths = selectedJob.interviews.map(i => i.strengths).join(' ');
    const allImprovements = selectedJob.interviews.map(i => i.improvements).join(' ');
    
    // Keywords extraction (simulated)
    const strengthKeywords = ['communication', 'technical', 'problem-solving', 'presentation', 'portfolio', 'experience', 'data-driven'];
    const improvementKeywords = ['system design', 'whiteboarding', 'culture fit', 'monetization', 'technical depth', 'preparation'];
    
    const myStrengths = strengthKeywords.filter(word => allStrengths.toLowerCase().includes(word.toLowerCase()));
    const myImprovements = improvementKeywords.filter(word => allImprovements.toLowerCase().includes(word.toLowerCase()));
    
    // Generate dynamic recommendations based on improvements
    let recommendations = [
      "Review common interview questions for your role",
      "Practice explaining your past projects concisely",
      "Prepare thoughtful questions about company culture"
    ];
    
    if (myImprovements.includes('system design')) {
      recommendations.push("Study system design patterns and practice whiteboarding solutions");
    }
    
    if (myImprovements.includes('technical depth')) {
      recommendations.push("Deepen knowledge in core technical areas through targeted practice");
    }
    
    if (averageRating < 7) {
      recommendations.push("Consider mock interviews with industry professionals for feedback");
    }
    
    // Calculate success metrics
    const successRate = {
      applied: jobs.length,
      interviews: jobs.filter(job => job.status === 'Interview' || job.status === 'Final Round').length,
      offers: jobs.filter(job => job.status === 'Offer' || job.status === 'Accepted').length
    };
    
    const conversionRate = Math.round((successRate.interviews / successRate.applied) * 100) || 0;
    const offerRate = Math.round((successRate.offers / successRate.interviews) * 100) || 0;
    
    const analysis = {
      overallScore: Math.round(averageRating * 10),
      interviewCount,
      averageRating: averageRating.toFixed(1),
      topStrengths: myStrengths.length > 0 ? myStrengths.slice(0, 3) : ["Not enough data"],
      topImprovements: myImprovements.length > 0 ? myImprovements.slice(0, 3) : ["Not enough data"],
      recommendations: recommendations.slice(0, 4),
      successRate,
      conversionRate,
      offerRate
    };
    
    setAiAnalysis(analysis);
    setShowAnalysisModal(true);
  };

  // Filtering
  const filterJobs = () => {
    if (currentFilter === 'All') return jobs;
    return jobs.filter(job => job.status === currentFilter);
  };

  // Stats calculation
  const stats = {
    total: jobs.length,
    applied: jobs.filter(job => job.status === 'Applied').length,
    interviews: jobs.filter(job => ['Phone Screen', 'Interview', 'Final Round'].includes(job.status)).length,
    offers: jobs.filter(job => job.status === 'Offer').length,
    highPriority: jobs.filter(job => job.priority === 'High').length,
    rejected: jobs.filter(job => job.status === 'Rejected').length,
    acceptanceRate: Math.round((jobs.filter(job => job.status === 'Offer').length / jobs.length) * 100) || 0
  };

  // Progress calculation
  const progress = {
    interviews: Math.min(100, Math.round((stats.interviews / stats.total) * 100)) || 0,
    offers: Math.min(100, Math.round((stats.offers / stats.total) * 100)) || 0
  };

  // Get color based on priority
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100';
    }
  };

  // Get color based on status
  const getStatusColor = (status) => {
    switch(status) {
      case 'Applied': return 'bg-blue-100 text-blue-800';
      case 'Rejected': return 'bg-gray-100 text-gray-800';
      case 'Phone Screen': return 'bg-purple-100 text-purple-800';
      case 'Interview': return 'bg-indigo-100 text-indigo-800';
      case 'Final Round': return 'bg-pink-100 text-pink-800';
      case 'Offer': return 'bg-green-100 text-green-800';
      case 'Accepted': return 'bg-emerald-100 text-emerald-800';
      case 'Declined': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100';
    }
  };

  // Get theme-based styles
  const getThemeStyles = () => {
    switch(theme) {
      case 'dark':
        return {
          bg: 'bg-gray-900',
          card: 'bg-gray-800',
          text: 'text-white',
          subtext: 'text-gray-400', // 明るくして可読性向上
          border: 'border-gray-700',
          button: 'bg-indigo-600 hover:bg-indigo-700',
          input: 'bg-gray-700 border-gray-600 text-white',
          activeTab: 'border-indigo-400 text-white font-bold' // アクティブタブのスタイル
        };
      default:
        return {
          bg: 'bg-gray-50',
          card: 'bg-white',
          text: 'text-gray-800',
          subtext: 'text-gray-600', // 暗くして可読性向上
          border: 'border-gray-200',
          button: 'bg-blue-600 hover:bg-blue-700',
          input: 'bg-white border-gray-300 text-gray-800',
          activeTab: 'border-blue-600 text-gray-900 font-bold' // アクティブタブのスタイル
        };
    }
  };
  
  const themeStyles = getThemeStyles();

  // AI Analysis Modal
  const AIAnalysisModal = () => {
    if (!showAnalysisModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
        <div className={`${themeStyles.card} rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${themeStyles.text}`}>
              AI Interview Analysis
            </h2>
            <button 
              onClick={() => setShowAnalysisModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {aiAnalysis.interviewCount === 0 ? (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className={`text-lg font-medium ${themeStyles.text} mb-2`}>No Interview Data Available</h3>
              <p className={`${themeStyles.subtext} mb-4`}>Add interview experiences to receive AI-powered insights</p>
              <button
                onClick={() => {
                  setShowAnalysisModal(false);
                  setShowInterviewForm(true);
                }}
                className={`px-4 py-2 text-white ${themeStyles.button} rounded-lg`}
              >
                Add Interview Experience
              </button>
            </div>
          ) : (
            <>
              {/* Overall Score */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-lg font-medium ${themeStyles.text}`}>Overall Performance</h3>
                  <p className={`${themeStyles.subtext}`}>Based on {aiAnalysis.interviewCount} interview(s)</p>
                </div>
                <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-blue-500">
                  <span className={`text-3xl font-bold ${themeStyles.text}`}>{aiAnalysis.overallScore}</span>
                </div>
              </div>
              
              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className={`text-lg font-medium ${themeStyles.text} mb-3`}>Your Strengths</h3>
                  <ul className="space-y-2">
                    {aiAnalysis.topStrengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className={themeStyles.text}>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className={`text-lg font-medium ${themeStyles.text} mb-3`}>Areas for Improvement</h3>
                  <ul className="space-y-2">
                    {aiAnalysis.topImprovements.map((improvement, index) => (
                      <li key={index} className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className={themeStyles.text}>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Recommendations */}
              <div className="mb-6">
                <h3 className={`text-lg font-medium ${themeStyles.text} mb-3`}>Personalized Recommendations</h3>
                <div className={`p-4 rounded-lg bg-blue-50 border border-blue-100 ${theme === 'dark' ? 'bg-blue-900 bg-opacity-20 border-blue-800' : ''}`}>
                  <ul className="space-y-3">
                    {aiAnalysis.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                        <span className={themeStyles.text}>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Success Metrics */}
              <div>
                <h3 className={`text-lg font-medium ${themeStyles.text} mb-3`}>Your Success Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-2xl font-bold ${themeStyles.text}`}>{aiAnalysis.conversionRate}%</p>
                    <p className={`text-sm ${themeStyles.subtext}`}>Interview Rate</p>
                  </div>
                  <div className={`p-3 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-2xl font-bold ${themeStyles.text}`}>{aiAnalysis.offerRate}%</p>
                    <p className={`text-sm ${themeStyles.subtext}`}>Offer Rate</p>
                  </div>
                  <div className={`p-3 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-2xl font-bold ${themeStyles.text}`}>{aiAnalysis.averageRating}</p>
                    <p className={`text-sm ${themeStyles.subtext}`}>Avg. Rating</p>
                  </div>
                  <div className={`p-3 text-center rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-2xl font-bold ${themeStyles.text}`}>{aiAnalysis.interviewCount}</p>
                    <p className={`text-sm ${themeStyles.subtext}`}>Interviews</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Interview Form Modal
  const InterviewFormModal = () => {
    if (!showInterviewForm) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
        <div className={`${themeStyles.card} rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-bold ${themeStyles.text}`}>
              Add Interview Experience
            </h2>
            <button 
              onClick={() => setShowInterviewForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${themeStyles.text} mb-1`}>Interview Date</label>
              <input
                type="date"
                name="date"
                value={newInterview.date}
                onChange={handleInterviewInputChange}
                className={`w-full p-2 border rounded ${themeStyles.input}`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${themeStyles.text} mb-1`}>Interview Type</label>
              <select
                name="type"
                value={newInterview.type}
                onChange={handleInterviewInputChange}
                className={`w-full p-2 border rounded ${themeStyles.input}`}
              >
                {interviewTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${themeStyles.text} mb-1`}>Interview Notes</label>
              <textarea
                name="notes"
                value={newInterview.notes}
                onChange={handleInterviewInputChange}
                className={`w-full p-2 border rounded ${themeStyles.input}`}
                rows="3"
                placeholder="What questions were asked? Who interviewed you? What topics were covered?"
              ></textarea>
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${themeStyles.text} mb-1`}>Your Strengths</label>
              <textarea
                name="strengths"
                value={newInterview.strengths}
                onChange={handleInterviewInputChange}
                className={`w-full p-2 border rounded ${themeStyles.input}`}
                rows="2"
                placeholder="What went well? What were you proud of?"
              ></textarea>
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${themeStyles.text} mb-1`}>Areas for Improvement</label>
              <textarea
                name="improvements"
                value={newInterview.improvements}
                onChange={handleInterviewInputChange}
                className={`w-full p-2 border rounded ${themeStyles.input}`}
                rows="2"
                placeholder="What could you have done better? What would you change?"
              ></textarea>
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${themeStyles.text} mb-1`}>Self-Rating (1-10)</label>
              <div className="flex items-center">
                <input
                  type="range"
                  name="rating"
                  min="1"
                  max="10"
                  value={newInterview.rating}
                  onChange={handleInterviewInputChange}
                  className="w-full"
                />
                <span className={`ml-3 font-medium ${themeStyles.text}`}>{newInterview.rating}</span>
              </div>
            </div>
            
            <div className="pt-4">
              <button
                onClick={addInterview}
                className={`w-full py-2 px-4 text-white ${themeStyles.button} rounded-lg`}
              >
                Save Interview Experience
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Job Details Modal
  const JobDetailsModal = () => {
        if (!showJobDetailsModal || !selectedJob) return null;
        
        return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
            <div className={`${themeStyles.card} rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-2xl font-bold ${themeStyles.text}`}>Job Details</h2>
                <button 
                onClick={() => setShowJobDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
            </div>
            
            {/* Job Header */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h2 className={`text-2xl font-bold ${themeStyles.text}`}>{selectedJob.company}</h2>
                    <p className={`text-lg ${themeStyles.subtext}`}>{selectedJob.position}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedJob.status)}`}>
                    {selectedJob.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(selectedJob.priority)}`}>
                    {selectedJob.priority} Priority
                    </span>
                </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <span className={`text-sm font-medium ${themeStyles.subtext}`}>Applied On:</span>
                    <p className={`${themeStyles.text}`}>{selectedJob.dateApplied}</p>
                </div>
                <div>
                    <span className={`text-sm font-medium ${themeStyles.subtext}`}>Interviews:</span>
                    <p className={`${themeStyles.text}`}>{selectedJob.interviews.length}</p>
                </div>
                <div>
                    <span className={`text-sm font-medium ${themeStyles.subtext}`}>Last Updated:</span>
                    <p className={`${themeStyles.text}`}>{new Date().toLocaleDateString()}</p>
                </div>
                </div>
                
                {selectedJob.notes && (
                <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`text-md font-medium ${themeStyles.text} mb-2`}>Notes</h3>
                    <p className={`${themeStyles.text}`}>{selectedJob.notes}</p>
                </div>
                )}
                
                <div className="flex gap-2 mt-6">
                <button
                    onClick={() => {
                    setShowJobDetailsModal(false);
                    editJob(selectedJob);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
                >
                    Edit Job
                </button>
                <button
                    onClick={() => {
                    setShowJobDetailsModal(false);
                    deleteJob(selectedJob.id);
                    }}
                    className="px-4 py-2 bg-red-100 text-red-800 rounded-lg"
                >
                    Delete
                </button>
                </div>
            </div>
            
            {/* Interview Experiences */}
            <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${themeStyles.text}`}>Interview Experiences</h2>
                <button
                    onClick={() => {
                    setShowJobDetailsModal(false);
                    setShowInterviewForm(true);
                    }}
                    className={`px-4 py-2 text-white ${themeStyles.button} rounded-lg`}
                >
                    Add Interview
                </button>
                </div>
                
                {selectedJob.interviews.length === 0 ? (
                <div className="text-center py-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className={`text-lg font-medium ${themeStyles.text} mb-2`}>No Interview Experiences</h3>
                    <p className={`${themeStyles.subtext} mb-4`}>Record your interview experiences to get AI-powered insights</p>
                    <button
                    onClick={() => {
                        setShowJobDetailsModal(false);
                        setShowInterviewForm(true);
                    }}
                    className={`px-4 py-2 text-white ${themeStyles.button} rounded-lg`}
                    >
                    Add First Interview
                    </button>
                </div>
                ) : (
                <>
                    <div className="space-y-4 mb-6">
                    {selectedJob.interviews.map((interview, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${themeStyles.border}`}>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                            <div className="flex items-center">
                                <h3 className={`font-medium ${themeStyles.text}`}>{interview.type} Interview</h3>
                                <span className="inline-block w-2 h-2 rounded-full bg-gray-300 mx-2"></span>
                                <span className={`text-sm ${themeStyles.subtext}`}>{interview.date}</span>
                            </div>
                            <div className="flex items-center mt-1">
                                <span className={`text-sm ${themeStyles.subtext} mr-2`}>Self-Rating:</span>
                                <div className="flex">
                                {[...Array(10)].map((_, i) => (
                                    <svg
                                    key={i}
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-4 w-4 ${i < interview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    >
                                    <path d="M9.049 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                                    </svg>
                                ))}
                                </div>
                            </div>
                            </div>
                        </div>
                        
                        {interview.notes && (
                            <div className="mb-3">
                            <h4 className={`text-sm font-medium ${themeStyles.text} mb-1`}>Notes</h4>
                            <p className={`text-sm ${themeStyles.text}`}>{interview.notes}</p>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                            <h4 className={`text-sm font-medium ${themeStyles.text} mb-1`}>Strengths</h4>
                            <p className={`text-sm ${themeStyles.text}`}>{interview.strengths}</p>
                            </div>
                            <div>
                            <h4 className={`text-sm font-medium ${themeStyles.text} mb-1`}>Areas for Improvement</h4>
                            <p className={`text-sm ${themeStyles.text}`}>{interview.improvements}</p>
                            </div>
                        </div>
                        </div>
                    ))}
                    </div>
                    
                    <div className="text-center">
                    <button
                        onClick={() => {
                        setShowJobDetailsModal(false);
                        generateAIAnalysis();
                        }}
                        className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg inline-flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                        </svg>
                        Generate AI Interview Analysis
                    </button>
                    </div>
                </>
                )}
            </div>
            </div>
        </div>
        );
  };

  // メインコンポーネントのレンダリング部分
  return (
            <div className={`p-4 rounded-lg shadow-sm min-h-screen ${themeStyles.bg}`}>
            {/* App Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                <h1 className={`text-3xl font-bold ${themeStyles.text}`}>Career Compass</h1>
                <p className={`text-sm ${themeStyles.subtext}`}>Smarter job hunting with AI insights</p>
                </div>
                <div className="flex space-x-2">
                <button 
                    onClick={() => setTheme('default')}
                    className={`w-6 h-6 rounded-full bg-blue-500 ${theme === 'default' ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                ></button>
                <button 
                    onClick={() => setTheme('dark')}
                    className={`w-6 h-6 rounded-full bg-gray-800 ${theme === 'dark' ? 'ring-2 ring-offset-2 ring-gray-800' : ''}`}
                ></button>
                </div>
            </div>
            
            {/* Render Modals */}
            <AIAnalysisModal />
            <InterviewFormModal />
            <JobDetailsModal />
            
            {/* Navigation Tabs */}
            <div className={`flex border-b ${themeStyles.border} mb-6`}>
                <button 
                onClick={() => setActiveTab('dashboard')}
                className={`py-2 px-4 font-medium ${activeTab === 'dashboard' 
                    ? `${themeStyles.text} border-b-3 ${themeStyles.activeTab}` 
                    : themeStyles.subtext}`}
                >
                Dashboard
                </button>
                <button 
                onClick={() => setActiveTab('applications')}
                className={`py-2 px-4 font-medium ${activeTab === 'applications' 
                    ? `${themeStyles.text} border-b-3 ${themeStyles.activeTab}` 
                    : themeStyles.subtext}`}
                >
                Applications
                </button>
                <button 
                onClick={() => setActiveTab('insights')}
                className={`py-2 px-4 font-medium ${activeTab === 'insights' 
                    ? `${themeStyles.text} border-b-3 ${themeStyles.activeTab}` 
                    : themeStyles.subtext}`}
                >
                Insights
                </button>
            </div>
            
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
            <div>
            {/* Stats Section */}
            <div className={`${themeStyles.card} rounded-lg shadow-md p-6 mb-6`}>
                <h2 className={`text-xl font-bold mb-4 ${themeStyles.text}`}>Application Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                    <p className={`text-2xl font-bold ${themeStyles.text}`}>{stats.total}</p>
                    <p className={`${themeStyles.subtext}`}>Total Applications</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                    <p className={`text-2xl font-bold ${themeStyles.text}`}>{stats.interviews}</p>
                    <p className={`${themeStyles.subtext}`}>Interviews</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                    <p className={`text-2xl font-bold ${themeStyles.text}`}>{stats.offers}</p>
                    <p className={`${themeStyles.subtext}`}>Offers</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                    <p className={`text-2xl font-bold ${themeStyles.text}`}>{stats.acceptanceRate}%</p>
                    <p className={`${themeStyles.subtext}`}>Acceptance Rate</p>
                </div>
                </div>
                
                {/* Progress Bars */}
                <div className="space-y-4">
                <div>
                    <div className="flex justify-between mb-1">
                    <span className={`${themeStyles.text} text-sm font-medium`}>Interview Progress</span>
                    <span className={`${themeStyles.text} text-sm font-medium`}>{progress.interviews}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress.interviews}%` }}></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between mb-1">
                    <span className={`${themeStyles.text} text-sm font-medium`}>Offer Progress</span>
                    <span className={`${themeStyles.text} text-sm font-medium`}>{progress.offers}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${progress.offers}%` }}></div>
                    </div>
                </div>
                </div>
            </div>
            
            {/* Recent Activity */}
            <div className={`${themeStyles.card} rounded-lg shadow-md p-6 mb-6`}>
                <h2 className={`text-xl font-bold mb-4 ${themeStyles.text}`}>Recent Activity</h2>
                <div className="space-y-3">
                {jobs.slice(0, 3).map(job => (
                    <div key={job.id} className={`p-3 border ${themeStyles.border} rounded-lg flex justify-between items-center`}>
                    <div>
                        <h3 className={`font-medium ${themeStyles.text}`}>{job.company}</h3>
                        <p className={`text-sm ${themeStyles.subtext}`}>{job.position}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.status)}`}>
                        {job.status}
                        </span>
                        <button 
                        onClick={() => viewJobDetails(job)}
                        className="text-blue-600 hover:text-blue-800"
                        >
                        View
                        </button>
                    </div>
                    </div>
                ))}
                </div>
                <button 
                onClick={() => setActiveTab('applications')}
                className={`mt-4 text-sm font-medium text-blue-600 hover:text-blue-800`}
                >
                View all applications →
                </button>
            </div>
            
            {/* Quick Add */}
            <div className={`${themeStyles.card} rounded-lg shadow-md p-6`}>
                <h2 className={`text-xl font-bold mb-4 ${themeStyles.text}`}>Quick Add</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                    type="text"
                    name="company"
                    value={newJob.company}
                    onChange={handleInputChange}
                    className={`p-2 border rounded ${themeStyles.input}`}
                    placeholder="Company name"
                />
                <input
                    type="text"
                    name="position"
                    value={newJob.position}
                    onChange={handleInputChange}
                    className={`p-2 border rounded ${themeStyles.input}`}
                    placeholder="Position"
                />
                </div>
                <button 
                onClick={addJob}
                className={`px-4 py-2 text-white ${themeStyles.button} rounded-lg`}
                >
                Add Application
                </button>
            </div>
            </div>
        )}
        
        {/* Render Modals */}
        <AIAnalysisModal />
        <InterviewFormModal />
        <JobDetailsModal />
        
        {/* Applications Tab */}
        {activeTab === 'applications' && (
            <div>
            {/* Add/Edit Form */}
            <div className={`${themeStyles.card} rounded-lg shadow-md p-6 mb-6`}>
                <h2 className={`text-xl font-bold mb-4 ${themeStyles.text}`}>
                {editing ? 'Edit Job Application' : 'Add New Job Application'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                    <label className={`block text-sm font-medium ${themeStyles.text} mb-1`}>Company</label>
                    <input
                    type="text"
                    name="company"
                    value={newJob.company}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${themeStyles.input}`}
                    placeholder="Company name"
                    />
                </div>
                <div>
                    <label className={`block text-sm font-medium ${themeStyles.text} mb-1`}>Position</label>
                    <input
                    type="text"
                    name="position"
                    value={newJob.position}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${themeStyles.input}`}
                    placeholder="Job title"
                    />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${themeStyles.text} mb-1`}>Date Applied</label>
                  <input
                    type="text"
                    name="dateApplied"
                    value={newJob.dateApplied}
                    onChange={(e) => {
                      // 単純に入力を受け付ける
                      setNewJob({ ...newJob, dateApplied: e.target.value });
                    }}
                    className={`w-full p-2 border rounded ${themeStyles.input}`}
                    placeholder="YYYY-MM-DD"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: YYYY-MM-DD (e.g. 2025-02-28)</p>
                </div>
                <div>
                    <label className={`block text-sm font-medium ${themeStyles.text} mb-1`}>Status</label>
                    <select
                    name="status"
                    value={newJob.status}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${themeStyles.input}`}
                    >
                    {statusOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                    </select>
                </div>
                <div>
                    <label className={`block text-sm font-medium ${themeStyles.text} mb-1`}>Priority</label>
                    <select
                    name="priority"
                    value={newJob.priority}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${themeStyles.input}`}
                    >
                    {priorityOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                    </select>
                </div>
                </div>
                <div className="mb-4">
                <label className={`block text-sm font-medium ${themeStyles.text} mb-1`}>Notes</label>
                <textarea
                    name="notes"
                    value={newJob.notes}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${themeStyles.input}`}
                    rows="2"
                    placeholder="Add details like salary, contacts, or follow-up dates"
                ></textarea>
                </div>
                <div className="flex justify-end gap-2">
                {editing && (
                    <button 
                    onClick={() => {
                        setEditing(false);
                        setNewJob({
                        id: null,
                        company: '',
                        position: '',
                        dateApplied: '',
                        status: 'Applied',
                        priority: 'Medium',
                        notes: '',
                        interviews: []
                        });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
                    >
                    Cancel
                    </button>
                )}
                <button 
                    onClick={addJob}
                    className={`px-4 py-2 text-white ${themeStyles.button} rounded-lg`}
                >
                    {editing ? 'Update' : 'Add'} Job
                </button>
                </div>
            </div>

            {/* View and Filter Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex space-x-2">
                <button
                    onClick={() => setView('cards')}
                    className={`px-3 py-1 rounded ${view === 'cards' ? `${themeStyles.button} text-white` : 'bg-gray-200'}`}
                >
                    Cards
                </button>
                <button
                    onClick={() => setView('table')}
                    className={`px-3 py-1 rounded ${view === 'table' ? `${themeStyles.button} text-white` : 'bg-gray-200'}`}
                >
                    Table
                </button>
                </div>
                <select
                value={currentFilter}
                onChange={(e) => setCurrentFilter(e.target.value)}
                className={`p-2 border rounded ${themeStyles.input}`}
                >
                <option value="All">All Applications</option>
                {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                ))}
                </select>
            </div>

            {/* Applications List */}
            {view === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterJobs().map(job => (
                    <div key={job.id} className={`${themeStyles.card} rounded-lg shadow-md p-4`}>
                    <div className="flex justify-between items-start mb-3">
                        <div>
                        <h3 className={`font-medium ${themeStyles.text}`}>{job.company}</h3>
                        <p className={`text-sm ${themeStyles.subtext}`}>{job.position}</p>
                        </div>
                        <div className="flex space-x-2">
                        <button
                            onClick={() => editJob(job)}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => deleteJob(job.id)}
                            className="text-red-600 hover:text-red-800"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.status)}`}>
                        {job.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(job.priority)}`}>
                        {job.priority}
                        </span>
                    </div>
                    <div className="mb-3">
                        <span className={`text-sm ${themeStyles.subtext}`}>Applied: {job.dateApplied}</span>
                    </div>
                    {job.notes && (
                        <p className={`text-sm ${themeStyles.text} mb-3 line-clamp-2`}>{job.notes}</p>
                    )}
                    <button
                        onClick={() => viewJobDetails(job)}
                        className={`text-sm text-blue-600 hover:text-blue-800 font-medium`}
                    >
                        View Details →
                    </button>
                    </div>
                ))}
                </div>
            ) : (
                <div className={`${themeStyles.card} rounded-lg shadow-md overflow-hidden`}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
                    <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${themeStyles.subtext} uppercase tracking-wider`}>Company</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${themeStyles.subtext} uppercase tracking-wider`}>Position</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${themeStyles.subtext} uppercase tracking-wider`}>Status</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${themeStyles.subtext} uppercase tracking-wider`}>Priority</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${themeStyles.subtext} uppercase tracking-wider`}>Date Applied</th>
                        <th className={`px-6 py-3 text-right text-xs font-medium ${themeStyles.subtext} uppercase tracking-wider`}>Actions</th>
                    </tr>
                    </thead>
                    <tbody className={`divide-y ${themeStyles.border}`}>
                    {filterJobs().map(job => (
                        <tr key={job.id}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeStyles.text}`}>{job.company}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeStyles.text}`}>{job.position}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.status)}`}>
                            {job.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(job.priority)}`}>
                            {job.priority}
                            </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeStyles.text}`}>{job.dateApplied}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                            onClick={() => viewJobDetails(job)}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                            >
                            View
                            </button>
                            <button
                            onClick={() => editJob(job)}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                            >
                            Edit
                            </button>
                            <button
                            onClick={() => deleteJob(job.id)}
                            className="text-red-600 hover:text-red-800"
                            >
                            Delete
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            )}
            </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
            <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Application Status Distribution */}
                <div className={`${themeStyles.card} rounded-lg shadow-md p-6`}>
                <h2 className={`text-xl font-bold mb-4 ${themeStyles.text}`}>Application Status Distribution</h2>
                <div className="relative h-64 mb-4">
                    {/* Render pie chart */}
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                    {(() => {
                        // Prepare data for pie chart
                        const statusCounts = statusOptions.map(status => ({
                        status,
                        count: jobs.filter(job => job.status === status).length
                        })).filter(item => item.count > 0);
                        
                        const total = statusCounts.reduce((sum, item) => sum + item.count, 0);
                        if (total === 0) return null;
                        
                        // Calculate segments
                        let startAngle = 0;
                        const segments = statusCounts.map((item, index) => {
                        const percentage = item.count / total;
                        const angle = percentage * 360;
                        const endAngle = startAngle + angle;
                        
                        // Convert to radians for SVG path
                        const startRad = (startAngle - 90) * Math.PI / 180;
                        const endRad = (endAngle - 90) * Math.PI / 180;
                        
                        // Calculate path
                        const x1 = 50 + 40 * Math.cos(startRad);
                        const y1 = 50 + 40 * Math.sin(startRad);
                        const x2 = 50 + 40 * Math.cos(endRad);
                        const y2 = 50 + 40 * Math.sin(endRad);
                        
                        const largeArcFlag = angle > 180 ? 1 : 0;
                        const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                        
                        // Get color based on status but make it more vibrant
                        let color;
                        switch(item.status) {
                            case 'Applied': color = '#3B82F6'; break; // blue-500
                            case 'Rejected': color = '#6B7280'; break; // gray-500
                            case 'Phone Screen': color = '#8B5CF6'; break; // purple-500
                            case 'Interview': color = '#4F46E5'; break; // indigo-600
                            case 'Final Round': color = '#EC4899'; break; // pink-500
                            case 'Offer': color = '#10B981'; break; // emerald-500
                            case 'Accepted': color = '#059669'; break; // emerald-600
                            case 'Declined': color = '#F59E0B'; break; // amber-500
                            default: color = '#9CA3AF'; // gray-400
                        }
                        
                        // Store end angle for next segment
                        startAngle = endAngle;
                        
                        return {
                            path,
                            color,
                            status: item.status,
                            count: item.count,
                            percentage: Math.round(percentage * 100)
                        };
                        });
                        
                        return segments.map((segment, index) => (
                        <path 
                            key={index}
                            d={segment.path}
                            fill={segment.color}
                            stroke={theme === 'dark' ? '#1F2937' : 'white'}
                            strokeWidth="0.5"
                        >
                            <title>{segment.status}: {segment.count} ({segment.percentage}%)</title>
                        </path>
                        ));
                    })()}
                    </svg>
                </div>
                
                {/* Legend */}
                <div className="grid grid-cols-2 gap-2">
                    {statusOptions.filter(status => jobs.filter(job => job.status === status).length > 0).map(status => {
                    const count = jobs.filter(job => job.status === status).length;
                    const percentage = jobs.length > 0 ? Math.round((count / jobs.length) * 100) : 0;
                    
                    // Get matching color from chart
                    let color;
                    switch(status) {
                        case 'Applied': color = '#3B82F6'; break; // blue-500
                        case 'Rejected': color = '#6B7280'; break; // gray-500
                        case 'Phone Screen': color = '#8B5CF6'; break; // purple-500
                        case 'Interview': color = '#4F46E5'; break; // indigo-600
                        case 'Final Round': color = '#EC4899'; break; // pink-500
                        case 'Offer': color = '#10B981'; break; // emerald-500
                        case 'Accepted': color = '#059669'; break; // emerald-600
                        case 'Declined': color = '#F59E0B'; break; // amber-500
                        default: color = '#9CA3AF'; // gray-400
                    }
                    
                    return (
                        <div key={status} className="flex items-center">
                        <div className="w-3 h-3 mr-2" style={{ backgroundColor: color }}></div>
                        <span className={`text-sm ${themeStyles.text}`}>
                            {status}: {count} ({percentage}%)
                        </span>
                        </div>
                    );
                    })}
                </div>
                </div>
                
                {/* Priority Distribution */}
                <div className={`${themeStyles.card} rounded-lg shadow-md p-6`}>
                <h2 className={`text-xl font-bold mb-4 ${themeStyles.text}`}>Priority Distribution</h2>
                <div className="relative h-64 mb-4">
                    {/* Render pie chart */}
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                    {(() => {
                        // Prepare data for pie chart
                        const priorityCounts = priorityOptions.map(priority => ({
                        priority,
                        count: jobs.filter(job => job.priority === priority).length
                        })).filter(item => item.count > 0);
                        
                        const total = priorityCounts.reduce((sum, item) => sum + item.count, 0);
                        if (total === 0) return null;
                        
                        // Calculate segments
                        let startAngle = 0;
                        const segments = priorityCounts.map((item, index) => {
                        const percentage = item.count / total;
                        const angle = percentage * 360;
                        const endAngle = startAngle + angle;
                        
                        // Convert to radians for SVG path
                        const startRad = (startAngle - 90) * Math.PI / 180;
                        const endRad = (endAngle - 90) * Math.PI / 180;
                        
                        // Calculate path
                        const x1 = 50 + 40 * Math.cos(startRad);
                        const y1 = 50 + 40 * Math.sin(startRad);
                        const x2 = 50 + 40 * Math.cos(endRad);
                        const y2 = 50 + 40 * Math.sin(endRad);
                        
                        const largeArcFlag = angle > 180 ? 1 : 0;
                        const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                        
                        // Get color based on priority with more vibrant colors
                        let color;
                        switch(item.priority) {
                            case 'High': color = '#EF4444'; break; // red-500
                            case 'Medium': color = '#F59E0B'; break; // amber-500
                            case 'Low': color = '#10B981'; break; // emerald-500
                            default: color = '#9CA3AF'; // gray-400
                        }
                        
                        // Store end angle for next segment
                        startAngle = endAngle;
                        
                        return {
                            path,
                            color,
                            priority: item.priority,
                            count: item.count,
                            percentage: Math.round(percentage * 100)
                        };
                        });
                        
                        return segments.map((segment, index) => (
                        <path 
                            key={index}
                            d={segment.path}
                            fill={segment.color}
                            stroke={theme === 'dark' ? '#1F2937' : 'white'}
                            strokeWidth="0.5"
                        >
                            <title>{segment.priority}: {segment.count} ({segment.percentage}%)</title>
                        </path>
                        ));
                    })()}
                    </svg>
                  </div>
                
                {/* Legend */}
                <div className="grid grid-cols-3 gap-2">
                    {priorityOptions.filter(priority => jobs.filter(job => job.priority === priority).length > 0).map(priority => {
                    const count = jobs.filter(job => job.priority === priority).length;
                    const percentage = jobs.length > 0 ? Math.round((count / jobs.length) * 100) : 0;
                    
                    // Get matching color from chart
                    let color;
                    switch(priority) {
                        case 'High': color = '#EF4444'; break; // red-500
                        case 'Medium': color = '#F59E0B'; break; // amber-500
                        case 'Low': color = '#10B981'; break; // emerald-500
                        default: color = '#9CA3AF'; // gray-400
                    }
                    
                    return (
                        <div key={priority} className="flex items-center">
                        <div className="w-3 h-3 mr-2" style={{ backgroundColor: color }}></div>
                        <span className={`text-sm ${themeStyles.text}`}>
                            {priority}: {count} ({percentage}%)
                        </span>
                        </div>
                    );
                    })}
                </div>
                </div>
            </div>
            
            {/* Application Timeline */}
            <div className={`${themeStyles.card} rounded-lg shadow-md p-6 mb-6`}>
                <h2 className={`text-xl font-bold mb-4 ${themeStyles.text}`}>Application Timeline</h2>
                <div className="h-64 flex items-center justify-center">
                <p className={`${themeStyles.subtext}`}>Timeline visualization will be available soon</p>
                </div>
            </div>
            
            {/* Interview Performance */}
            <div className={`${themeStyles.card} rounded-lg shadow-md p-6`}>
                <h2 className={`text-xl font-bold mb-4 ${themeStyles.text}`}>Interview Performance</h2>
                <div className="h-64 flex items-center justify-center">
                <p className={`${themeStyles.subtext}`}>Interview performance analytics will be available soon</p>
                </div>
            </div>
            </div>
        )}
        </div>
  );
};

export default JobApplicationTracker;