
import React, { useState, useEffect, useCallback } from 'react';
import { EDUCATION_LEVELS, EDUCATION_DATA, BOOK_SERIES, DISPATCHES } from '../constants/educationData';
import { Lesson, EducationLevel, GenerationStatus } from '../types';
import { parseLessonsWithRules, parseLessonsFromRows, ParsedLessonResult } from '../services/ruleBasedParser';
import { parseLessonsFromText, generateLessonPlan } from '../services/geminiService';
import { UploadIcon, DocumentTextIcon, SparklesIcon, DownloadIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from './Icons';
import Spinner from './Spinner';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

declare global {
  interface Window {
    XLSX: any;
  }
}

const LessonPlanner: React.FC = () => {
  // Form State
  const [selectedBookSeries, setSelectedBookSeries] = useState<string>(BOOK_SERIES[0]);
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel>(EDUCATION_LEVELS[0]);
  const [selectedGrade, setSelectedGrade] = useState<string>(EDUCATION_DATA[EDUCATION_LEVELS[0]][0].name);
  const [selectedSubject, setSelectedSubject] = useState<string>(EDUCATION_DATA[EDUCATION_LEVELS[0]][0].subjects[0]);
  const [selectedDispatch, setSelectedDispatch] = useState<string>('1001');
  const [teachingPlanFile, setTeachingPlanFile] = useState<File | null>(null);
  
  // App Logic State
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [generationProgress, setGenerationProgress] = useState('');
  const [prompts, setPrompts] = useState<{ [key: string]: string }>({});
  const [promptsLoading, setPromptsLoading] = useState(true);


  // Derived State
  const grades = EDUCATION_DATA[selectedLevel] || [];
  const subjects = grades.find(g => g.name === selectedGrade)?.subjects || [];
  const selectedLessonsCount = lessons.filter(l => l.selected).length;

  useEffect(() => {
    const fetchPrompts = async () => {
        setPromptsLoading(true);
        try {
            const [prompt5512Res, prompt2345Res, prompt1001Res] = await Promise.all([
                fetch('./prompts/5512.md'),
                fetch('./prompts/2345.md'),
                fetch('./prompts/1001.md'),
            ]);

            if (!prompt5512Res.ok || !prompt2345Res.ok || !prompt1001Res.ok) {
                throw new Error('Không thể tải file mẫu câu lệnh.');
            }

            const prompt5512 = await prompt5512Res.text();
            const prompt2345 = await prompt2345Res.text();
            const prompt1001 = await prompt1001Res.text();

            setPrompts({
                '5512': prompt5512,
                '2345': prompt2345,
                '1001': prompt1001,
            });
        } catch (error) {
            console.error("Error fetching prompts:", error);
            setErrorMessage(error instanceof Error ? error.message : "Không thể tải các mẫu câu lệnh. Vui lòng làm mới trang.");
            setStatus('error');
        } finally {
            setPromptsLoading(false);
        }
    };

    fetchPrompts();
  }, []);

  // Reset grade and subject when level changes
  useEffect(() => {
    const newGrades = EDUCATION_DATA[selectedLevel];
    if (newGrades.length > 0) {
      const newGrade = newGrades[0];
      setSelectedGrade(newGrade.name);
      setSelectedSubject(newGrade.subjects[0] || '');
    } else {
        setSelectedGrade('');
        setSelectedSubject('');
    }
    setLessons([]);
  }, [selectedLevel]);

  // Reset subject when grade changes
  useEffect(() => {
    const newSubjects = EDUCATION_DATA[selectedLevel]?.find(g => g.name === selectedGrade)?.subjects;
    if (newSubjects && newSubjects.length > 0) {
      setSelectedSubject(newSubjects[0]);
    } else {
        setSelectedSubject('');
    }
    setLessons([]);
  }, [selectedGrade, selectedLevel]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTeachingPlanFile(e.target.files[0]);
      setLessons([]);
      setGeneratedContent('');
      setStatus('idle');
      setErrorMessage('');
    }
  };
  
  const handleParseFile = useCallback(async () => {
    if (!teachingPlanFile) {
        setErrorMessage("Vui lòng chọn file kế hoạch giảng dạy.");
        return;
    }
    
    setStatus('parsing');
    setErrorMessage('');
    setLessons([]);
    setGeneratedContent('');

    const fileExtension = teachingPlanFile.name.split('.').pop()?.toLowerCase();
    const isExcel = fileExtension === 'xls' || fileExtension === 'xlsx';

    const reader = new FileReader();

    reader.onload = async (e) => {
        try {
            let parsedResults: ParsedLessonResult[] = [];
            let fullTextContent = '';

            if (isExcel) {
                if (!window.XLSX) {
                    throw new Error("Thư viện xử lý Excel chưa được tải. Vui lòng kiểm tra kết nối mạng và thử lại.");
                }
                const data = new Uint8Array(e.target!.result as ArrayBuffer);
                const workbook = window.XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const rows = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
                
                // Thử phân tích dựa trên dòng/cột trước
                parsedResults = parseLessonsFromRows(rows);
                fullTextContent = rows.map(row => (row as any[]).join(' ')).join('\n');
            } else {
                fullTextContent = e.target?.result as string;
                parsedResults = parseLessonsWithRules(fullTextContent);
            }

            // Nếu phân tích quy tắc thất bại, dùng AI
            if (parsedResults.length === 0 && fullTextContent.trim()) {
                console.log("Rule-based parsing found no lessons, falling back to AI.");
                parsedResults = await parseLessonsFromText(fullTextContent, selectedSubject, selectedGrade);
            }

            if (parsedResults.length === 0) {
                throw new Error("Không thể tìm thấy danh sách bài học nào trong file. Vui lòng kiểm tra lại định dạng file.");
            }

            const formattedLessons: Lesson[] = parsedResults.map((item, index) => {
                return {
                    id: index,
                    title: item.title,
                    periods: item.periods,
                    selected: true,
                    isIntegrated: item.isIntegrated
                }
            });
            setLessons(formattedLessons);
            setStatus('idle');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Đã có lỗi xảy ra.");
            setStatus('error');
        }
    };

    reader.onerror = () => {
        setErrorMessage("Lỗi khi đọc file.");
        setStatus('error');
    };
    
    if (isExcel) {
        reader.readAsArrayBuffer(teachingPlanFile);
    } else {
        reader.readAsText(teachingPlanFile);
    }

  }, [teachingPlanFile, selectedSubject, selectedGrade]);


  const handleToggleLesson = (id: number) => {
    setLessons(lessons.map(l => l.id === id ? { ...l, selected: !l.selected } : l));
  };
  
  const handleToggleSelectAll = () => {
    const allSelected = lessons.every(l => l.selected);
    setLessons(lessons.map(l => ({ ...l, selected: !allSelected })));
  };

  const handleGenerate = async () => {
    const lessonsToGenerate = lessons.filter(l => l.selected);
    if(lessonsToGenerate.length === 0) {
        setErrorMessage("Vui lòng chọn ít nhất một bài để soạn giáo án.");
        return;
    }

    setStatus('generating');
    setErrorMessage('');
    setGeneratedContent('');
    const basePrompt = prompts[selectedDispatch];
    if (!basePrompt) {
        setErrorMessage("Mẫu câu lệnh chưa được tải. Vui lòng chờ hoặc làm mới trang.");
        setStatus('error');
        return;
    }

    let fullContent = '';
    for(let i=0; i<lessonsToGenerate.length; i++) {
        const lesson = lessonsToGenerate[i];
        setGenerationProgress(`Đang soạn bài ${i+1}/${lessonsToGenerate.length}: ${lesson.title}`);
        try {
            const plan = await generateLessonPlan(
                lesson.title, 
                '', 
                basePrompt, 
                selectedBookSeries, 
                selectedSubject, 
                selectedGrade
            );
            fullContent += `\n\n===================================\n`;
            fullContent += `GIÁO ÁN BÀI: ${lesson.title.toUpperCase()}\n`;
            fullContent += `BỘ SÁCH: ${selectedBookSeries}\n`;
            fullContent += `===================================\n\n`;
            fullContent += plan;
            setGeneratedContent(fullContent);
        } catch (error) {
            fullContent += `\n\n Lỗi khi tạo giáo án cho bài: ${lesson.title}`;
            setGeneratedContent(fullContent);
        }
    }

    setGenerationProgress('');
    setStatus('done');
  };

  const handleDownload = async () => {
    try {
      const sections = generatedContent.split('===================================').filter(s => s.trim());
      
      const docElements: any[] = [];

      sections.forEach((section, index) => {
        const lines = section.split('\n');
        lines.forEach(line => {
          const trimmed = line.trim();
          if (!trimmed) {
            docElements.push(new Paragraph({ text: "" }));
            return;
          }

          // Format Headers
          if (trimmed.startsWith('GIÁO ÁN BÀI:') || trimmed.startsWith('BỘ SÁCH:')) {
            docElements.push(new Paragraph({
              text: trimmed,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 },
            }));
          } 
          // Format Section Headings (e.g., I. YÊU CẦU CẦN ĐẠT)
          else if (/^[IVX]+\./.test(trimmed) || /^\d+\./.test(trimmed)) {
             docElements.push(new Paragraph({
                children: [
                    new TextRun({
                        text: trimmed,
                        bold: true,
                        size: 28, // 14pt
                    }),
                ],
                spacing: { before: 150, after: 100 },
            }));
          }
          // Default Paragraph
          else {
            docElements.push(new Paragraph({
              children: [
                new TextRun({
                  text: trimmed,
                  size: 24, // 12pt
                }),
              ],
              spacing: { after: 100 },
            }));
          }
        });
        
        // Add Page Break between lessons except the last one
        if (index < sections.length - 1) {
            // docElements.push(new Paragraph({ children: [new PageBreak()] })); // Simplified, we can just add a big space or Heading
        }
      });

      const doc = new Document({
        sections: [{
          properties: {},
          children: docElements,
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `giao_an_${selectedSubject.replace(/\s+/g, '_')}_${selectedGrade.replace(/\s+/g, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error creating docx:", error);
      alert("Đã xảy ra lỗi khi tạo file Word. Vui lòng thử lại.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 h-full">
      {/* Left Panel: Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg flex flex-col space-y-4 sm:space-y-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-700 border-b pb-3">1. Cấu hình thông tin</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Bộ sách" value={selectedBookSeries} onChange={(e) => setSelectedBookSeries(e.target.value)} options={BOOK_SERIES} />
          <Select label="Công văn" value={selectedDispatch} onChange={(e) => setSelectedDispatch(e.target.value)} options={DISPATCHES.map(d => ({ value: d.id, label: d.name }))} />
          <Select label="Cấp học" value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value as EducationLevel)} options={EDUCATION_LEVELS} />
          <Select label="Lớp" value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} options={grades.map(g => g.name)} disabled={grades.length === 0} />
          <Select label="Môn học" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} options={subjects} disabled={subjects.length === 0} className="sm:col-span-2" />
        </div>
        
        <h2 className="text-lg sm:text-xl font-bold text-gray-700 border-b pb-3 pt-2">2. Tải lên & Phân tích</h2>
        <div className="flex flex-col space-y-4">
             <label className="block text-sm font-medium text-gray-700">Kế hoạch giảng dạy</label>
             <label htmlFor="file-upload" className="mt-1 flex cursor-pointer justify-center rounded-md border-2 border-dashed border-gray-300 px-4 pt-4 pb-5 transition-colors duration-200 hover:border-indigo-400 sm:px-6 sm:pt-5 sm:pb-6">
                <div className="space-y-1 text-center">
                    <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                        <span className="font-medium text-indigo-600">
                            Tải lên một file
                        </span>
                        <p className="pl-1">hoặc kéo thả</p>
                    </div>
                    <p className="text-xs text-gray-500">{teachingPlanFile ? teachingPlanFile.name : '.xls, .xlsx, .txt, .md'}</p>
                </div>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".txt,.md,.xls,.xlsx"/>
             </label>
             <button
                onClick={handleParseFile}
                disabled={!teachingPlanFile || status === 'parsing'}
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
             >
                {status === 'parsing' ? <Spinner/> : <DocumentTextIcon/>}
                {status === 'parsing' ? 'Đang phân tích...' : 'Phân tích & Lấy danh sách bài học'}
             </button>
        </div>

        {lessons.length > 0 && (
            <div className="flex flex-col space-y-4 pt-2 flex-grow min-h-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-700 border-b pb-3">3. Chọn bài học</h2>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input id="select-all" type="checkbox" checked={lessons.every(l => l.selected)} onChange={handleToggleSelectAll} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                        <label htmlFor="select-all" className="ml-2 block text-sm text-gray-900">Chọn tất cả</label>
                    </div>
                    <span className="text-sm text-gray-500">{selectedLessonsCount}/{lessons.length} bài đã chọn</span>
                </div>
                <div className="border rounded-md overflow-y-auto flex-grow bg-gray-50 p-2 max-h-[40vh] lg:max-h-none">
                    <ul className="space-y-2">
                        {lessons.map(lesson => (
                            <li key={lesson.id} className="p-2 bg-white rounded-md shadow-sm flex items-center justify-between">
                                <div className="flex items-center flex-grow mr-2">
                                    <input id={`lesson-${lesson.id}`} type="checkbox" checked={lesson.selected} onChange={() => handleToggleLesson(lesson.id)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
                                    <label htmlFor={`lesson-${lesson.id}`} className="ml-3 block text-sm font-medium text-gray-700 truncate">
                                        {lesson.title} 
                                    </label>
                                </div>
                                {lesson.isIntegrated && <span className="flex-shrink-0 text-[10px] font-semibold bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">Tích hợp</span>}
                            </li>
                        ))}
                    </ul>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={selectedLessonsCount === 0 || status === 'generating' || promptsLoading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
                >
                    {status === 'generating' ? <Spinner /> : <SparklesIcon />}
                    {status === 'generating' ? 'Đang soạn...' : `Soạn ${selectedLessonsCount} giáo án đã chọn`}
                </button>
            </div>
        )}

      </div>

      {/* Right Panel: Results */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg flex flex-col">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
             <h2 className="text-lg sm:text-xl font-bold text-gray-700">Kết quả</h2>
             {status === 'done' && (
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <DownloadIcon/> Tải file Word (.docx)
                </button>
             )}
        </div>
        
        <div className="flex-grow bg-gray-50 rounded-md p-4 overflow-y-auto whitespace-pre-wrap font-mono text-sm relative break-words">
            {status === 'idle' && !generatedContent && !promptsLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <InformationCircleIcon className="w-12 h-12 sm:w-16 sm:h-16 mb-4 text-gray-300"/>
                    <h3 className="text-base sm:text-lg font-medium">Sẵn sàng để bắt đầu</h3>
                    <p className="max-w-md">Hoàn thành các bước bên trái để xem giáo án được tạo tại đây.</p>
                </div>
            )}
            {(promptsLoading && status !== 'error') && (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <Spinner size="lg" />
                    <p className="mt-4 text-gray-600 font-semibold">Đang tải tài nguyên...</p>
                </div>
            )}
            {status === 'generating' && (
                <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center text-gray-600">
                    <Spinner size="lg" />
                    <p className="mt-4 font-semibold">{generationProgress}</p>
                </div>
            )}
             {status === 'error' && errorMessage && (
                <div className="flex flex-col items-center justify-center h-full text-center text-red-600">
                    <ExclamationTriangleIcon className="w-12 h-12 sm:w-16 sm:h-16 mb-4"/>
                    <h3 className="text-base sm:text-lg font-medium">Đã xảy ra lỗi</h3>
                    <p className="max-w-md">{errorMessage}</p>
                </div>
            )}
             {status === 'done' && (
                <div className="flex flex-col items-center justify-center h-full text-center text-green-600 absolute inset-0 bg-white/90 p-4">
                    <CheckCircleIcon className="w-12 h-12 sm:w-16 sm:h-16 mb-4"/>
                    <h3 className="text-base sm:text-lg font-medium">Hoàn tất!</h3>
                    <p className="max-w-md">Giáo án đã được tạo thành công. Bạn có thể xem lại và tải về.</p>
                </div>
             )}
             {generatedContent}
        </div>
      </div>
    </div>
  );
};


interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: (string | { value: string; label: string })[];
}

const Select: React.FC<SelectProps> = ({ label, options, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <select {...props} className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
            {options.map((opt, index) => {
                const value = typeof opt === 'string' ? opt : opt.value;
                const label = typeof opt === 'string' ? opt : opt.label;
                return <option key={index} value={value}>{label}</option>
            })}
        </select>
    </div>
);


export default LessonPlanner;
