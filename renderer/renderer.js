const $ = (sel) => document.querySelector(sel);

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    $('#tab-' + tab.dataset.tab).classList.add('active');
    hideStatus();
  });
});

function showStatus(message, type = 'info') {
  const el = $('#status');
  el.textContent = message;
  el.className = 'status ' + type;
}
function hideStatus() { $('#status').className = 'status'; }

$('#file-input-btn').onclick = async () => {
  const p = await window.api.pickFile();
  if (p) $('#file-input').value = p;
};

$('#file-output-btn').onclick = async () => {
  const p = await window.api.pickSave($('#file-output').value || 'output');
  if (p) $('#file-output').value = p;
};

function validateFileInputs() {
  const pw = $('#file-password').value;
  const input = $('#file-input').value.trim();
  const output = $('#file-output').value.trim();

  if (!input) { showStatus('Укажите исходный файл', 'error'); return null; }
  if (!output) { showStatus('Укажите путь сохранения', 'error'); return null; }
  if (!pw) { showStatus('Введите пароль', 'error'); return null; }
  return { inputPath: input, outputPath: output, password: pw };
}

$('#encrypt-file-btn').onclick = async () => {
  const params = validateFileInputs();
  if (!params) return;
  showStatus('Шифрование...', 'info');
  const res = await window.api.encryptFile(params);
  res.ok
    ? showStatus(`Файл зашифрован (${res.size} байт)`, 'success')
    : showStatus(res.error, 'error');
};

$('#decrypt-file-btn').onclick = async () => {
  const params = validateFileInputs();
  if (!params) return;
  showStatus('Расшифрование...', 'info');
  const res = await window.api.decryptFile(params);
  res.ok
    ? showStatus(`Файл расшифрован (${res.size} байт)`, 'success')
    : showStatus(res.error, 'error');
};

function validateTextInputs() {
  const pw = $('#text-password').value;
  const text = $('#text-input').value;
  if (!text.trim()) { showStatus('Введите текст', 'error'); return null; }
  if (!pw) { showStatus('Введите пароль', 'error'); return null; }
  return { text, password: pw };
}

$('#encrypt-text-btn').onclick = async () => {
  const params = validateTextInputs();
  if (!params) return;
  const res = await window.api.encryptText(params);
  if (res.ok) {
    $('#text-output').value = res.result;
    showStatus('Текст зашифрован (Base64)', 'success');
  } else showStatus(res.error, 'error');
};

$('#decrypt-text-btn').onclick = async () => {
  const params = validateTextInputs();
  if (!params) return;
  const res = await window.api.decryptText(params);
  if (res.ok) {
    $('#text-output').value = res.result;
    showStatus('Текст расшифрован', 'success');
  } else showStatus(res.error, 'error');
};