import json

# โหลดข้อมูลจากไฟล์
with open('c2.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# เพิ่ม level ถ้ายังไม่มี
for item in data:
    if 'level' not in item: 
        item['level'] = 'c2'

# บันทึกกลับไปยังไฟล์เดิม หรือไฟล์ใหม่
with open('c2.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print("เพิ่ม key 'level': 'c2' เรียบร้อยแล้ว")

# to run this script, save it as c2_addlevel.py and run it in the same directory as c2.json