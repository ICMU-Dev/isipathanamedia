
const fs = require('fs');
let data = fs.readFileSync('C:/Users/User/.gemini/antigravity/brain/b77380d7-56c4-4312-9e10-ccbb4c2f58c7/.system_generated/logs/transcript_full.jsonl', 'utf8');
let lines = data.split('\n');
let maxReplace = '';
for (let line of lines) {
  if (line.includes('replace_file_content')) {
    try {
      let obj = JSON.parse(line);
      if (obj.tool_calls) {
        for (let call of obj.tool_calls) {
          if (call.name === 'default_api:replace_file_content' && call.arguments.TargetFile.includes('CreateArticle.jsx')) {
            if (call.arguments.ReplacementContent && call.arguments.ReplacementContent.length > maxReplace.length) {
              maxReplace = call.arguments.ReplacementContent;
            }
          }
        }
      }
    } catch(e) {}
  }
}
fs.writeFileSync('max_replace.txt', maxReplace, 'utf8');

