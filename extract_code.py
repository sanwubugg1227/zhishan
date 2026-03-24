import os
from docx import Document
from docx.shared import Pt
from docx.oxml.ns import qn

# ===== 配置区 =====
source_dir = 'src'  # 指定读取 src 文件夹
output_file = '智膳系统_源代码.docx'
# ==================

all_lines = []

print(f"正在扫描并读取 {source_dir} 目录下的所有文件...")

# 检查 src 目录是否存在
if not os.path.exists(source_dir):
    print(f"❌ 错误：找不到名为 '{source_dir}' 的文件夹，请确认该脚本与 src 文件夹在同一级目录下。")
else:
    # 1. 遍历读取 src 下的所有文件
    for root, dirs, files in os.walk(source_dir):
        # 保留排除名单，防止 src 内部有编译缓存等（如 __pycache__ 或打包生成的 dist）
        dirs[:] = [d for d in dirs if d not in [
            'node_modules', '.git', 'venv', '.venv', 'env', '.env', 
            'lib', 'Lib', 'site-packages', '__pycache__', 'dist', 'build'
        ]]
        
        for file in files:
            path = os.path.join(root, file)
            # 【核心修改点】：去掉了后缀名判断，直接尝试读取所有文件
            try:
                # 尝试以 UTF-8 纯文本格式读取
                with open(path, 'r', encoding='utf-8') as f:
                    for line in f:
                        clean_line = line.rstrip()
                        if clean_line:  # 剔除纯空行
                            all_lines.append(clean_line)
            except UnicodeDecodeError:
                # 如果遇到图片、音频、字体等二进制文件，读取会报错，这里捕获并跳过
                print(f"⚠️ 已自动跳过非文本文件: {file}")
            except Exception as e:
                # 捕获其他可能的读取权限错误
                print(f"⚠️ 读取 {file} 时跳过: {e}")

    # 2. 提取前1500行和后1500行
    if len(all_lines) > 3000:
        print(f"\n代码总行数({len(all_lines)}行)大于3000行，正在提取前1500行和后1500行...")
        final_lines = all_lines[:1500] + all_lines[-1500:]
    else:
        print(f"\n代码总行数({len(all_lines)}行)不足3000行，全部提取...")
        final_lines = all_lines

    if not final_lines:
        print("⚠️ 警告：没有读取到任何有效代码，请检查 src 目录。")
    else:
        # 3. 写入Word文档
        print("正在生成 Word 文档...")
        doc = Document()

        # 设置全文字体为宋体，五号字（最适合控制一页50行）
        style = doc.styles['Normal']
        font = style.font
        font.name = '宋体'
        font.size = Pt(10.5) 
        style.element.rPr.rFonts.set(qn('w:eastAsia'), '宋体')

        # 将代码合并成大段落写入，防止 Word 处理过慢
        chunk_size = 50 
        for i in range(0, len(final_lines), chunk_size):
            chunk = "\n".join(final_lines[i:i+chunk_size])
            doc.add_paragraph(chunk)

        doc.save(output_file)
        print(f"✅ 提取完成！共提取 {len(final_lines)} 行有效代码，已保存至当前目录下的 {output_file}")