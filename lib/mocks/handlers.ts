import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock API endpoints
  http.get('/api/words', ({ request }) => {
    const url = new URL(request.url)
    const level = url.searchParams.get('level')
    
    const mockWords = {
      a1: [
        { id: 1, word: 'hello', type: 'interjection', meaning: 'สวัสดี' },
        { id: 2, word: 'cat', type: 'noun', meaning: 'แมว' },
        { id: 3, word: 'run', type: 'verb', meaning: 'วิ่ง' },
      ],
      a2: [
        { id: 4, word: 'beautiful', type: 'adjective', meaning: 'สวยงาม' },
        { id: 5, word: 'house', type: 'noun', meaning: 'บ้าน' },
        { id: 6, word: 'study', type: 'verb', meaning: 'เรียน' },
      ],
      b1: [
        { id: 7, word: 'necessary', type: 'adjective', meaning: 'จำเป็น' },
        { id: 8, word: 'environment', type: 'noun', meaning: 'สิ่งแวดล้อม' },
        { id: 9, word: 'develop', type: 'verb', meaning: 'พัฒนา' },
      ],
    }
    
    return HttpResponse.json(mockWords[level as keyof typeof mockWords] || [])
  }),

  http.post('/api/scores', () => {
    return HttpResponse.json({ success: true, id: 1 })
  }),

  http.get('/api/auth/session', () => {
    return HttpResponse.json({
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
      },
    })
  }),
]