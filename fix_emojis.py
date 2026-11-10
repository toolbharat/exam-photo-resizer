import os

root_dir = r'C:\Users\sanja\Documents\GitHub\exam-photo-resizer'

def emoji_to_entity(char):
    try:
        codepoint = ord(char)
        if codepoint > 127:  # Only convert non-ASCII (emojis, special chars)
            return f'&#{codepoint};'
        return char
    except:
        return char

fixed_count = 0
for dirpath, _, filenames in os.walk(root_dir):
    for filename in filenames:
        if filename.endswith('.html'):
            filepath = os.path.join(dirpath, filename)
            try:
                with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
                    content = f.read()
                
                new_content = ''.join(emoji_to_entity(c) for c in content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f'Fixed: {filename}')
                    fixed_count += 1
            except Exception as e:
                print(f'Error in {filename}: {e}')

print(f'\nTotal files fixed: {fixed_count}')
