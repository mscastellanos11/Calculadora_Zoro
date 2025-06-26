document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DE NAVEGACIÓN POR PESTAÑAS ---
    const tabs = document.querySelectorAll('.tab-link');
    const panes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    // ===================================================================
    // --- CALCULADORA 1: PROMEDIO POR MATERIA (3 CORTES) ---
    // ===================================================================
    const MAX_PESOS = {
        corte1: 30,
        corte2: 30,
        corte3: 40,
    };
    const PONDERACIONES_CORTES = { corte1: 0.3, corte2: 0.3, corte3: 0.4 };
    const NOTA_APROBATORIA_MATERIA = 3.0;

    document.querySelectorAll('.btn-add-grade').forEach(button => {
        button.addEventListener('click', (e) => {
            addGradeRowMateria(e.target.dataset.corte);
            validateAndCalculateCorte(e.target.dataset.corte);
        });
    });

    document.getElementById('tab-materia').addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove-grade')) {
            const corteId = e.target.closest('.corte-container').id.replace('corte', '');
            e.target.closest('.grade-row').remove();
            validateAndCalculateCorte(corteId);
        }
    });

    document.getElementById('tab-materia').addEventListener('input', (e) => {
        if (e.target.matches('.credit-input')) { // Solo validamos los pesos
            const corteId = e.target.closest('.corte-container').id.replace('corte', '');
            validateAndCalculateCorte(corteId, e.target);
        } else if (e.target.matches('.grade-input')) { // Si es nota, solo recalcula
            const corteId = e.target.closest('.corte-container').id.replace('corte', '');
            validateAndCalculateCorte(corteId);
        }
    });

    document.getElementById('btn-calculate-materia').addEventListener('click', calculateFinalMateriaGrade);

    function addGradeRowMateria(corteId) {
        const list = document.querySelector(`#corte${corteId} .grade-list`);
        const row = document.createElement('div');
        row.className = 'grade-row';
        row.innerHTML = `<input type="number" class="grade-input" placeholder="Nota (Ej: 4.5)"><input type="number" class="credit-input" placeholder="Peso % (Ej: 20)"><button class="btn-remove-grade">X</button>`;
        list.appendChild(row);
    }

    function validateAndCalculateCorte(corteId, triggeredInput = null) {
        const rows = document.querySelectorAll(`#corte${corteId} .grade-row`);
        const warningDiv = document.querySelector(`#corte${corteId} .corte-warning`);
        const addButton = document.querySelector(`.btn-add-grade[data-corte="${corteId}"]`);
        const limitePeso = MAX_PESOS[`corte${corteId}`];
        
        let sumPesos = 0;
        rows.forEach(row => {
            const peso = parseFloat(row.querySelector('.credit-input').value) || 0;
            sumPesos += peso;
        });

        if (sumPesos > limitePeso && triggeredInput) {
            const valorActual = parseFloat(triggeredInput.value) || 0;
            const exceso = sumPesos - limitePeso;
            const valorCorregido = valorActual - exceso;
            
            triggeredInput.value = valorCorregido.toFixed(1);
            warningDiv.textContent = "Límite alcanzado. Valor ajustado.";
            
            sumPesos = 0;
            rows.forEach(row => sumPesos += parseFloat(row.querySelector('.credit-input').value) || 0);
        } else {
            warningDiv.textContent = "";
        }

        addButton.disabled = sumPesos >= limitePeso;

        let sumPonderado = 0;
        rows.forEach(row => {
            const nota = parseFloat(row.querySelector('.grade-input').value) || 0;
            const peso = parseFloat(row.querySelector('.credit-input').value) || 0;
            if (peso > 0) {
                sumPonderado += nota * peso;
            }
        });
        
        const promedio = sumPesos === 0 ? 0 : sumPonderado / sumPesos;
        document.getElementById(`corte${corteId}-result`).textContent = promedio.toFixed(2);
        return promedio;
    }

    function calculateFinalMateriaGrade() {
        const prom1 = validateAndCalculateCorte('1');
        const prom2 = validateAndCalculateCorte('2');
        const prom3 = validateAndCalculateCorte('3');
        const notaFinal = (prom1 * PONDERACIONES_CORTES.corte1) + (prom2 * PONDERACIONES_CORTES.corte2) + (prom3 * PONDERACIONES_CORTES.corte3);
        
        const finalGradeSpan = document.getElementById('materia-final-grade');
        const finalMessageP = document.getElementById('materia-final-message');
        
        finalGradeSpan.classList.remove('visible');
        finalMessageP.classList.remove('visible');

        finalGradeSpan.textContent = notaFinal.toFixed(2);
        if (notaFinal >= NOTA_APROBATORIA_MATERIA) {
            finalMessageP.textContent = "Técnica dominada. ¡Materia aprobada!";
            finalMessageP.style.color = '#00ff9b';
        } else {
            finalMessageP.textContent = "Necesitas más entrenamiento en esta técnica.";
            finalMessageP.style.color = '#ff6b6b';
        }
        
        void finalGradeSpan.offsetWidth;
        finalGradeSpan.classList.add('visible');
        finalMessageP.classList.add('visible');
    }

    // ===================================================================
    // --- CALCULADORA 2: PROMEDIO DEL SEMESTRE (POR CRÉDITOS) ---
    // ===================================================================
    const NOTA_APROBATORIA_SEMESTRE = 3.5;
    document.getElementById('btn-add-materia').addEventListener('click', addMateriaRow);
    document.getElementById('tab-semestre').addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove-grade')) {
            e.target.closest('.grade-row').remove();
        }
    });
    document.getElementById('btn-calculate-semestre').addEventListener('click', calculateFinalSemestreGrade);

    function addMateriaRow() {
        const list = document.getElementById('semestre-grade-list');
        const row = document.createElement('div');
        row.className = 'grade-row';
        row.innerHTML = `<input type="number" class="grade-input" placeholder="Nota Final Materia"><input type="number" class="credit-input" placeholder="Créditos Materia"><button class="btn-remove-grade">X</button>`;
        list.appendChild(row);
    }
    
    function calculateFinalSemestreGrade() {
        const rows = document.querySelectorAll('#semestre-grade-list .grade-row');
        let sumPonderado = 0, sumCreditos = 0;
        rows.forEach(row => {
            const nota = parseFloat(row.querySelector('.grade-input').value);
            const creditos = parseFloat(row.querySelector('.credit-input').value);
            if (!isNaN(nota) && !isNaN(creditos) && creditos > 0) {
                sumPonderado += nota * creditos;
                sumCreditos += creditos;
            }
        });
        const promedioFinal = sumCreditos === 0 ? 0 : sumPonderado / sumCreditos;

        const finalGradeSpan = document.getElementById('semestre-final-grade');
        const finalMessageP = document.getElementById('semestre-final-message');

        finalGradeSpan.classList.remove('visible');
        finalMessageP.classList.remove('visible');

        finalGradeSpan.textContent = promedioFinal.toFixed(2);
        if (promedioFinal >= NOTA_APROBATORIA_SEMESTRE) {
            finalMessageP.textContent = "¡Dominio total! Eres el mejor espadachín de este semestre.";
            finalMessageP.style.color = '#00ff9b';
        } else {
            finalMessageP.textContent = "Te has perdido en el camino... ¡Pero puedes recuperarte!";
            finalMessageP.style.color = '#ff6b6b';
        }
        
        void finalGradeSpan.offsetWidth;
        finalGradeSpan.classList.add('visible');
        finalMessageP.classList.add('visible');
    }

    // Inicializar con una fila en cada calculadora para guiar al usuario
    addGradeRowMateria('1');
    addGradeRowMateria('2');
    addGradeRowMateria('3');
    addMateriaRow();
});