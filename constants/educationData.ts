
import { EducationLevel, EducationData } from '../types';

export const BOOK_SERIES: string[] = [
  'Kết nối tri thức với cuộc sống',
  'Chân trời sáng tạo',
  'Cánh diều',
  'Bộ sách khác',
];

export const DISPATCHES: { id: string, name: string }[] = [
    { id: '5512', name: 'Công văn 5512' },
    { id: '2345', name: 'Công văn 2345' },
    { id: '1001', name: 'Công văn 1001' },
];

export const EDUCATION_LEVELS: EducationLevel[] = ['Tiểu học', 'THCS', 'THPT'];

export const EDUCATION_DATA: EducationData = {
  'Tiểu học': [
    { name: 'Lớp 1', subjects: ['Tiếng Việt', 'Toán', 'Đạo đức', 'Tự nhiên và Xã hội', 'Âm nhạc', 'Mĩ thuật', 'Hoạt động trải nghiệm', 'Giáo dục thể chất'] },
    { name: 'Lớp 2', subjects: ['Tiếng Việt', 'Toán', 'Đạo đức', 'Tự nhiên và Xã hội', 'Công nghệ', 'Tin học', 'Âm nhạc', 'Mĩ thuật', 'Hoạt động trải nghiệm', 'Giáo dục thể chất'] },
    { name: 'Lớp 3', subjects: ['Tiếng Việt', 'Toán', 'Ngoại ngữ 1', 'Đạo đức', 'Tự nhiên và Xã hội', 'Công nghệ', 'Tin học', 'Âm nhạc', 'Mĩ thuật', 'Hoạt động trải nghiệm', 'Giáo dục thể chất'] },
    { name: 'Lớp 4', subjects: ['Tiếng Việt', 'Toán', 'Ngoại ngữ 1', 'Lịch sử và Địa lí', 'Khoa học', 'Đạo đức', 'Công nghệ', 'Tin học', 'Âm nhạc', 'Mĩ thuật', 'Hoạt động trải nghiệm', 'Giáo dục thể chất'] },
    { name: 'Lớp 5', subjects: ['Tiếng Việt', 'Toán', 'Ngoại ngữ 1', 'Lịch sử và Địa lí', 'Khoa học', 'Đạo đức', 'Công nghệ', 'Tin học', 'Âm nhạc', 'Mĩ thuật', 'Hoạt động trải nghiệm', 'Giáo dục thể chất'] },
  ],
  'THCS': [
    { name: 'Lớp 6', subjects: ['Ngữ văn', 'Toán', 'Ngoại ngữ 1', 'Giáo dục công dân', 'Lịch sử và Địa lí', 'Khoa học tự nhiên', 'Công nghệ', 'Tin học', 'Giáo dục thể chất', 'Âm nhạc', 'Mĩ thuật', 'Hoạt động trải nghiệm, hướng nghiệp', 'Nội dung giáo dục của địa phương'] },
    { name: 'Lớp 7', subjects: ['Ngữ văn', 'Toán', 'Ngoại ngữ 1', 'Giáo dục công dân', 'Lịch sử và Địa lí', 'Khoa học tự nhiên', 'Công nghệ', 'Tin học', 'Giáo dục thể chất', 'Âm nhạc', 'Mĩ thuật', 'Hoạt động trải nghiệm, hướng nghiệp', 'Nội dung giáo dục của địa phương'] },
    { name: 'Lớp 8', subjects: ['Ngữ văn', 'Toán', 'Ngoại ngữ 1', 'Giáo dục công dân', 'Lịch sử và Địa lí', 'Khoa học tự nhiên', 'Công nghệ', 'Tin học', 'Giáo dục thể chất', 'Âm nhạc', 'Mĩ thuật', 'Hoạt động trải nghiệm, hướng nghiệp', 'Nội dung giáo dục của địa phương'] },
    { name: 'Lớp 9', subjects: ['Ngữ văn', 'Toán', 'Ngoại ngữ 1', 'Giáo dục công dân', 'Lịch sử và Địa lí', 'Khoa học tự nhiên', 'Công nghệ', 'Tin học', 'Giáo dục thể chất', 'Âm nhạc', 'Mĩ thuật', 'Hoạt động trải nghiệm, hướng nghiệp', 'Nội dung giáo dục của địa phương'] },
  ],
  'THPT': [
    { name: 'Lớp 10', subjects: ['Ngữ văn', 'Toán', 'Ngoại ngữ 1', 'Lịch sử', 'Giáo dục thể chất', 'Giáo dục quốc phòng và an ninh', 'Hoạt động trải nghiệm, hướng nghiệp', 'Nội dung giáo dục của địa phương', 'Địa lí', 'Giáo dục kinh tế và pháp luật', 'Vật lí', 'Hóa học', 'Sinh học', 'Công nghệ', 'Tin học', 'Âm nhạc', 'Mĩ thuật'] },
    { name: 'Lớp 11', subjects: ['Ngữ văn', 'Toán', 'Ngoại ngữ 1', 'Lịch sử', 'Giáo dục thể chất', 'Giáo dục quốc phòng và an ninh', 'Hoạt động trải nghiệm, hướng nghiệp', 'Nội dung giáo dục của địa phương', 'Địa lí', 'Giáo dục kinh tế và pháp luật', 'Vật lí', 'Hóa học', 'Sinh học', 'Công nghệ', 'Tin học', 'Âm nhạc', 'Mĩ thuật'] },
    { name: 'Lớp 12', subjects: ['Ngữ văn', 'Toán', 'Ngoại ngữ 1', 'Lịch sử', 'Giáo dục thể chất', 'Giáo dục quốc phòng và an ninh', 'Hoạt động trải nghiệm, hướng nghiệp', 'Nội dung giáo dục của địa phương', 'Địa lí', 'Giáo dục kinh tế và pháp luật', 'Vật lí', 'Hóa học', 'Sinh học', 'Công nghệ', 'Tin học', 'Âm nhạc', 'Mĩ thuật'] },
  ]
};
