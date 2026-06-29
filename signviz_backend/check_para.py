import importlib.util, os, re

spec = importlib.util.spec_from_file_location('sm', 'A2SL/synonym_map.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

assets_norm = {}
for f in os.listdir('assets'):
    if f.endswith('.webm'):
        base = f[:-5]
        norm = re.sub(r'[^a-z0-9 ]', '', base.lower()).strip()
        assets_norm[norm] = base

def find(word):
    n = re.sub(r'[^a-z0-9 ]', '', word.lower()).strip()
    if n in assets_norm: return assets_norm[n]
    dw = mod.resolve_synonym(word)
    if dw:
        n2 = re.sub(r'[^a-z0-9 ]', '', dw.lower()).strip()
        if n2 in assets_norm: return assets_norm[n2]
    return None

text = """English literature is very beautiful and wonderful Good writers use beautiful words to express emotion and meaning Students can learn language and communication through literature Literature helps us understand people culture and world better Good books and stories give knowledge and improve thinking Writers use beautiful language to describe life and different situations Reading literature can improve vocabulary expression and speaking skills Many students study poetry novels and drama in English literature classes Literature also helps people understand emotions and human behavior English literature is meaningful educational and interesting English literature is a wonderful way to learn language and expression Students study books poetry and stories to understand human life and emotions Good writers use beautiful and meaningful words to describe different situations Literature helps people improve vocabulary speaking and communication skills Many students enjoy reading novels and drama in college classes Literature also helps us understand culture behavior and human ideas Writers create meaningful stories about life emotions and different situations Students learn grammar vocabulary and expression through literature Reading literature helps people grow knowledge and improve thinking English literature is excellent and educational for all students English literature helps students understand language expression and human emotions Good writers use beautiful words to describe life and different situations Students study poetry novels and drama to improve vocabulary and communication Literature helps people understand culture behavior and human ideas Many students enjoy reading books and stories in college classes Writers create meaningful and wonderful stories about life and emotions Literature also helps students improve speaking writing and expression skills Reading literature helps people grow knowledge and improve thinking Students learn grammar and vocabulary through literature and communication English literature is very beautiful meaningful and wonderful for learning"""

words = sorted(set(re.findall(r"[a-zA-Z']+", text.lower())))
found = []
missing = []
for w in words:
    m = find(w)
    if m: found.append((w, m))
    else: missing.append(w)

print('HAVE ANIMATION (%d/%d unique words):' % (len(found), len(words)))
for w, m in found:
    if w.lower() == m.lower(): print('  ' + w)
    else: print('  %-22s -> %s' % (w, m))
print()
print('NO ANIMATION - finger-spelled (%d):' % len(missing))
for w in missing: print('  ' + w)
print()
print('Coverage: %d/%d (%d%%)' % (len(found), len(words), 100*len(found)//len(words)))
