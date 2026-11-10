import os

root_dir = r'C:\Users\sanja\Documents\GitHub\exam-photo-resizer'

replacements = {
    'ðŸ  ': '🏠',
    'ðŸ‡®ðŸ‡³': '🇮🇳',
    'ðŸ› ï¸ ': '🛠️',
    'ðŸ’°': '💰',
    'ðŸ“ ': '📝',
    'ðŸ“¬': '📬',
    'Â©': '©',
    'âœ‚': '✂',
    'ðŸ—œ': '🗜',
    'ðŸ”—': '🔗',
    'ðŸ“„': '📄',
    'ðŸ–¼': '🖼️',
    'ðŸ”‘': '🔑',
    'ðŸ“Š': '📊',
    'âœ  ï¸ ': '✍️',
    'ðŸ”¥': '🔥',
    'ðŸ“ˆ': '📈',
    'ðŸ”„': '🔄',
    'âœ ': '✓',
    'ðŸ§®': '🧮',
    'ðŸ” ': '🔍',
    'ðŸŒ¸': '🌸',
    'ðŸ“…': '📅',
    'ðŸ½': '🍽',
    'â›½': '⛽',
    'ðŸ’±': '💱',
    'âœ¨': '✨',
    'ðŸ”’': '🔒',
    'ðŸª™': '🪙',
    'ðŸŽ²': '🎲',
    'ðŸŽ¯': '🎯',
    'ðŸ”•': '🔕',
    'â±ï¸ ': '⏱️',
    'ðŸŽ‚': '🎂',
    'ðŸŽ“': '🎓',
    'ðŸŒ ': '🌍',
    'â†’': '→',
    'ðŸ‡ºðŸ‡¸': '🇺🇸',
    'ðŸ‡¬ðŸ‡§': '🇬🇧',
    'ðŸ‡¨ðŸ‡¦': '🇨🇦',
    'â¤ï¸ ': '❤️',
}

fixed = 0
for dirpath, _, filenames in os.walk(root_dir):
    for filename in filenames:
        if filename.endswith('.html'):
            filepath = os.path.join(dirpath, filename)
            with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
                content = f.read()
            original = content
            for bad, good in replacements.items():
                content = content.replace(bad, good)
            if content != original:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f'Fixed: {filename}')
                fixed += 1

print(f'\nTotal files fixed: {fixed}')
