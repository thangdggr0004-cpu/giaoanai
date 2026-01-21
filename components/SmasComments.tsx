
import React, { useState, useCallback } from 'react';
import { generateSmasComment } from '../services/geminiService';
import Spinner from './Spinner';
import { UploadIcon, SparklesIcon, ExclamationTriangleIcon, InformationCircleIcon, DownloadIcon, CheckCircleIcon } from './Icons';
import { Student } from '../types';

declare global {
  interface Window {
    XLSX: any;
  }
}

type SmasStatus = 'idle' | 'parsing' | 'ready' | 'generating' | 'done' | 'error';

const SmasComments: React.FC = () => {
    const [smasFile, setSmasFile] = useState<File | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [status, setStatus] = useState<SmasStatus>('idle');
    const [error, setError] = useState('');
    const [generationProgress, setGenerationProgress] = useState('');
    
    const selectedStudentCount = students.filter(s => s.selected).length;

    const scoreToPerformance = (score: number | string): string => {
        const numericScore = typeof score === 'string' ? parseFloat(score.replace(',', '.')) : score;
        if (isNaN(numericScore)) return 'Đạt';
        if (numericScore >= 9) return 'Tốt (Xuất sắc)';
        if (numericScore >= 7) return 'Khá';
        if (numericScore >= 5) return 'Đạt (Trung bình)';
        return 'Chưa đạt (Cần cố gắng)';
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSmasFile(e.target.files[0]);
            setStudents([]);
            setStatus('idle');
            setError('');
        }
    };
    
    const handleParseFile = useCallback(async () => {
        if (!smasFile) {
            setError("Vui lòng chọn một file.");
            return;
        }
        setStatus('parsing');
        setError('');

        try {
            if (!window.XLSX) {
                throw new Error("Thư viện xử lý Excel chưa được tải. Vui lòng kiểm tra kết nối mạng và thử lại.");
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target!.result as ArrayBuffer);
                    const workbook = window.XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
                    
                    if (json.length < 2) {
                        throw new Error("File không có dữ liệu hoặc định dạng không đúng.");
                    }

                    const headers = json[0].map(h => h.toString().trim().toLowerCase());
                    const nameIndex = headers.findIndex(h => h.includes('họ và tên') || h.includes('họ tên'));
                    const scoreIndex = headers.findIndex(h => h.includes('điểm'));

                    if (nameIndex === -1 || scoreIndex === -1) {
                        throw new Error("File Excel phải chứa cột 'Họ và Tên' và 'Điểm'.");
                    }
                    
                    const parsedStudents: Student[] = json.slice(1).map((row, index) => {
                        const name = row[nameIndex];
                        const score = row[scoreIndex];
                        if (!name) return null; 
                        return {
                            id: index,
                            name: name,
                            score: score ?? 'N/A',
                            comment: '',
                            selected: true,
                            status: 'pending'
                        }
                    }).filter((s): s is Student => s !== null);

                    if (parsedStudents.length === 0) {
                        throw new Error("Không tìm thấy dữ liệu học sinh hợp lệ trong file.");
                    }

                    setStudents(parsedStudents);
                    setStatus('ready');
                } catch(parseError) {
                    setError(parseError instanceof Error ? parseError.message : "Lỗi khi đọc file Excel.");
                    setStatus('error');
                }
            };
            reader.onerror = () => {
                setError("Lỗi khi đọc file.");
                setStatus('error');
            };
            reader.readAsArrayBuffer(smasFile);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
            setStatus('error');
        }
    }, [smasFile]);

    const handleToggleSelectAll = () => {
        const allSelected = students.every(s => s.selected);
        setStudents(students.map(s => ({...s, selected: !allSelected})));
    };

    const handleToggleStudent = (id: number) => {
        setStudents(students.map(s => s.id === id ? {...s, selected: !s.selected} : s));
    };

    const handleGenerate = async () => {
        const studentsToGenerate = students.filter(s => s.selected);
        if (studentsToGenerate.length === 0) {
            setError("Vui lòng chọn ít nhất một học sinh.");
            return;
        }

        setStatus('generating');
        setError('');
        setStudents(prev => prev.map(s => s.selected ? {...s, status: 'generating'} : s));

        for (let i = 0; i < studentsToGenerate.length; i++) {
            const student = studentsToGenerate[i];
            setGenerationProgress(`Đang tạo nhận xét cho ${i + 1}/${studentsToGenerate.length}: ${student.name}`);
            
            try {
                const performance = scoreToPerformance(student.score);
                const comments = await generateSmasComment('GVBM', student.name, performance, []); 
                const comment = comments[0] || "Không thể tạo nhận xét.";
                 setStudents(prev => prev.map(s => s.id === student.id ? {...s, comment: comment, status: 'done'} : s));
            } catch (err) {
                 setStudents(prev => prev.map(s => s.id === student.id ? {...s, comment: "Lỗi", status: 'error'} : s));
            }
        }

        setGenerationProgress('');
        setStatus('done');
    };

     const handleExport = () => {
        const dataToExport = students
            .filter(s => s.comment) 
            .map(s => ({
                "Họ và Tên": s.name,
                "Điểm": s.score,
                "Nhận xét (Chuẩn TT 22/26)": s.comment
            }));

        if (dataToExport.length === 0) {
            setError("Không có nhận xét nào để xuất file.");
            return;
        }

        const worksheet = window.XLSX.utils.json_to_sheet(dataToExport);
        const workbook = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(workbook, worksheet, "NhanXet");
        window.XLSX.writeFile(workbook, "nhan_xet_smas_chuan_tt22_26.xlsx");
    };


    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg h-full flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Nhận xét SMAS hàng loạt</h2>
                    <p className="text-xs text-indigo-600 font-medium">✨ Tự động bám sát Thông tư 22/2021 và 26/2020</p>
                </div>
            </div>
            
            {/* Step 1: Upload */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-2">1. Tải lên file Excel bảng điểm</label>
                <div className="flex flex-col sm:flex-row gap-2 items-start">
                    <div className="flex-grow w-full">
                        <label htmlFor="smas-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 p-2 border border-gray-300 flex items-center justify-center shadow-sm">
                            <UploadIcon className="w-5 h-5 mr-2" />
                            <span>{smasFile ? smasFile.name : 'Chọn file Excel từ máy...'}</span>
                            <input id="smas-file-upload" name="smas-file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".xls,.xlsx"/>
                        </label>
                    </div>
                    <button onClick={handleParseFile} disabled={!smasFile || status === 'parsing'} className="w-full sm:w-auto flex justify-center items-center gap-2 py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 transition-all">
                        {status === 'parsing' ? <Spinner/> : null}
                        {status === 'parsing' ? 'Đang đọc...' : 'Bắt đầu đọc file'}
                    </button>
                </div>
            </div>

            {/* Step 2 & 3: Review and Generate */}
            {students.length > 0 && (
                <div className="flex-grow flex flex-col min-h-0">
                    <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-700">2. Xem lại danh sách & Điểm số</h3>
                         <div className="flex items-center gap-4">
                            <div className="flex items-center">
                                <input id="select-all" type="checkbox" checked={students.every(s => s.selected)} onChange={handleToggleSelectAll} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                <label htmlFor="select-all" className="ml-2 block text-sm font-medium text-gray-900">Chọn tất cả ({selectedStudentCount}/{students.length})</label>
                            </div>
                         </div>
                    </div>
                    <div className="border rounded-md overflow-y-auto flex-grow bg-white">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-10"></th>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Học sinh</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-20">Điểm</th>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nhận xét (AI gợi ý theo TT 22/26)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.map(s => (
                                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-2"><input type="checkbox" checked={s.selected} onChange={() => handleToggleStudent(s.id)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded"/></td>
                                        <td className="px-4 py-2 text-sm font-bold text-gray-900">{s.name}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{s.score}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600">
                                            {s.status === 'generating' && <span className="flex items-center gap-2 text-xs italic"><Spinner size="sm"/> AI đang viết nhận xét...</span>}
                                            {s.status === 'done' && <div className="leading-relaxed">{s.comment}</div>}
                                            {s.status === 'error' && <span className="text-red-500 text-xs font-bold">Lỗi tạo nội dung</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     <div className="mt-4 flex flex-col sm:flex-row gap-3">
                         <button onClick={handleGenerate} disabled={selectedStudentCount === 0 || status === 'generating'} className="w-full sm:w-auto flex-grow flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-green-600 hover:bg-green-700 disabled:bg-green-300 transition-all">
                            <SparklesIcon className="w-5 h-5" /> {status === 'generating' ? 'Đang thực hiện...' : `Tự động viết nhận xét (${selectedStudentCount} HS)`}
                         </button>
                         {status === 'done' && (
                             <button onClick={handleExport} className="w-full sm:w-auto flex justify-center items-center gap-2 py-3 px-8 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all">
                                 <DownloadIcon className="w-5 h-5"/> Xuất file Excel (Sẵn sàng nộp)
                             </button>
                         )}
                     </div>
                     {status === 'generating' && <p className="text-sm text-center text-indigo-600 font-medium animate-pulse mt-2">{generationProgress}</p>}
                </div>
            )}

            {/* Initial State / Error State */}
            {status === 'idle' && students.length === 0 && (
                <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <InformationCircleIcon className="w-16 h-16 text-gray-200 mb-3"/>
                    <h3 className="font-bold text-gray-600">Dễ dàng tạo nhận xét học bạ</h3>
                    <p className="text-sm max-w-sm">Tải bảng điểm từ SMAS lên, AI sẽ giúp bạn soạn thảo lời nhận xét chuyên nghiệp và đúng quy định của Bộ Giáo dục.</p>
                </div>
            )}
             {status === 'error' && (
                 <div className="flex-grow flex flex-col items-center justify-center text-center text-red-600 bg-red-50 rounded-lg p-6">
                    <ExclamationTriangleIcon className="w-12 h-12 mb-2"/>
                    <h3 className="font-bold">Đã xảy ra lỗi</h3>
                    <p className="text-sm">{error}</p>
                </div>
            )}
             {status === 'done' && (
                 <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0"/>
                    <p className="text-sm text-green-800 font-medium">Hoàn tất! Hãy kiểm tra lại các lời nhận xét trước khi xuất file.</p>
                </div>
            )}

        </div>
    );
};

export default SmasComments;
