function extrairCampo(texto, chave) {
    const regex = new RegExp(chave + '\\s*[:=-]?\\s*(.+)', 'i');
    const match = texto.match(regex);
    return match ? match[1].trim() : '';
}

function extrairTelefone(texto) {
    const regex = /tel[^\d]*[\s-]*\(?(\d{2})\)?\s*(\d{4,5})-?(\d{4})/i;
    const match = texto.match(regex);
    if (match) {
        const ddd = match[1];
        const parte1 = match[2];
        const parte2 = match[3];
        return { ddd, numero: `${parte1}${parte2}`, completo: `(${ddd})${parte1}-${parte2}` };
    }
    return null;
}

function toggleTemplate() {
    const body = document.getElementById('templateBody');
    const icon = document.getElementById('toggleIcon');
    body.classList.toggle('open');
    icon.classList.toggle('open');
}

function gerar() {
    const ficha = document.getElementById('inputFicha').value;
    const valorCB = document.getElementById('valorCashback').value.trim();
    const template = document.getElementById('templateTexto').value;

    if (!ficha.trim()) {
        document.getElementById('outputMensagem').textContent = 'Cole uma ficha primeiro!';
        return;
    }

    const nome = extrairCampo(ficha, 'NOME');
    const cpf = extrairCampo(ficha, 'CPF');
    const valorTotalStr = extrairCampo(ficha, 'VALOR');

    const valorTotalNum = parseFloat(
        (valorTotalStr || '0')
            .replace(/[R$\s]/g, '')
            .replace(/\./g, '')
            .replace(/,/g, '.')
    );
    const percent = parseFloat(document.getElementById('porcentagem').value) || 0;
    const cashbackNum = valorTotalNum * (percent / 100);
    const cashbackFormatado = 'R$ ' + cashbackNum.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    document.getElementById('valorCashback').value = cashbackFormatado;

    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    const dataStr = amanha.toLocaleDateString('pt-BR');

    let tratamento = nome;
    if (tratamento) {
        const nomeUpper = nome.toUpperCase();
        if (nomeUpper.startsWith('SR ')) {
            tratamento = 'Sr.' + nome.substring(3);
        } else {
            tratamento = 'Sr.' + nome;
        }
    }

    let mensagem = template;
    mensagem = mensagem.replace(/\{tratamento\}/g, tratamento);
    mensagem = mensagem.replace(/\{nome\}/g, nome);
    mensagem = mensagem.replace(/\{cpf\}/g, cpf);
    mensagem = mensagem.replace(/\{valor\}/g, valorCB);
    mensagem = mensagem.replace(/\{data\}/g, dataStr);

    const output = document.getElementById('outputMensagem');
    output.textContent = mensagem;
    document.getElementById('charCount').textContent = mensagem.length + ' caracteres';
}

function copiarMsg() {
    const texto = document.getElementById('outputMensagem').textContent;
    if (!texto || texto === 'Aguardando ficha...') return;

    navigator.clipboard.writeText(texto).then(() => {
        mostrarToast('✅ Mensagem copiada!');
    });
}

function chamarWhats() {
    const ficha = document.getElementById('inputFicha').value;
    if (!ficha.trim()) {
        mostrarToast('⚠️ Cole uma ficha primeiro!', '#ef4444');
        return;
    }

    const tel = extrairTelefone(ficha);
    if (!tel) {
        mostrarToast('⚠️ Telefone não encontrado na ficha!', '#ef4444');
        return;
    }

    const numeroWhats = '55' + tel.ddd + tel.numero;
    window.open(`https://wa.me/${numeroWhats}`, '_blank');
}

function copiarNumero() {
    const ficha = document.getElementById('inputFicha').value;
    if (!ficha.trim()) {
        mostrarToast('⚠️ Cole uma ficha primeiro!', '#ef4444');
        return;
    }

    const tel = extrairTelefone(ficha);
    if (!tel) {
        mostrarToast('⚠️ Telefone não encontrado na ficha!', '#ef4444');
        return;
    }

    const numeroWhats = '55' + tel.ddd + tel.numero;
    navigator.clipboard.writeText(numeroWhats).then(() => {
        mostrarToast('🔢 Número copiado: ' + numeroWhats);
    });
}

function mostrarToast(texto, cor = '#22c55e') {
    const toast = document.getElementById('toast');
    toast.textContent = texto;
    toast.style.background = cor;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

function limpar() {
    document.getElementById('inputFicha').value = '';
    document.getElementById('outputMensagem').textContent = 'Aguardando ficha...';
    document.getElementById('charCount').textContent = '0 caracteres';
    document.getElementById('valorCashback').value = '';
}

document.addEventListener('DOMContentLoaded', () => {
    const el = document.getElementById('inputFicha');
    el.addEventListener('paste', () => setTimeout(gerar, 100));
    document.getElementById('porcentagem').addEventListener('input', gerar);
});
