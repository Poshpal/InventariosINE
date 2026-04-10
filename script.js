/*let inventoryData = [];
let currentResguardante = "";

// Escuchar cuando el usuario selecciona un resguardante del combo
document.getElementById("resguardanteSelect").addEventListener("change", function() {
    currentResguardante = this.value;
});

// Función para procesar el Excel
document.getElementById("fileInput").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
        // Leer el archivo
        const data = new Uint8Array(ev.target.result);
        const wb = XLSX.read(data, {type: "array"});
        const wsName = wb.SheetNames.find(n => n.toUpperCase().includes("BIENES")) || wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        
        // Convertir a JSON
        const rows = XLSX.utils.sheet_to_json(ws, {header: 1, defval: ""});

        // Filtrar y mapear los datos (Asegurando la lectura de la Columna L)
        inventoryData = rows.slice(1)
            .filter(r => r[2] && String(r[2]).includes("CS11"))
            .map(r => ({
                centro: r[0] || "11  JDE",
                activo: r[2] || "",
                descripcion: r[3] || "",
                condicion: r[8] || "",
                ubicacion: r[7] || "",
                resguardante: r[11] || "" // ← Columna L (Resguardante Actual)
            }))
            .filter(i => i.activo && i.resguardante);

       
      // Obtener lista única de resguardantes y ordenarla alfabéticamente
        const resguardantesUnicos = [...new Set(inventoryData.map(i => i.resguardante))].sort();

        // Mostrar estado de la carga
        const statusDiv = document.getElementById("status");
        statusDiv.classList.remove("hidden");
        statusDiv.innerHTML = `✅ <strong>${inventoryData.length}</strong> bienes cargados • <strong>${resguardantesUnicos.length}</strong> resguardantes encontrados.`;

        // Llenar el combo (select)
        const select = document.getElementById("resguardanteSelect");
        select.innerHTML = '<option value="">Selecciona un resguardante...</option>'; // Limpiar opciones previas
        
        resguardantesUnicos.forEach(resg => {
            const option = document.createElement("option");
            option.value = resg;
            option.textContent = resg;
            select.appendChild(option);
        });
    };
    reader.readAsArrayBuffer(file);
});*/

let inventoryData = [];
let currentResguardante = "";

// ==================== CARGA EXCEL (mejorada con más columnas) ====================
document.getElementById("fileInput").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
        const data = new Uint8Array(ev.target.result);
        const wb = XLSX.read(data, {type: "array"});
        const wsName = wb.SheetNames.find(n => n.toUpperCase().includes("BIENES")) || wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rows = XLSX.utils.sheet_to_json(ws, {header: 1, defval: ""});

        inventoryData = rows.slice(1)
            .filter(r => r[2] && String(r[2]).trim() !== "")
            .map(r => ({
                centro: r[0] || "CS11",
                activo: r[2] || "",
                descripcion: r[3] || "",
                marca: r[4] || "",
                serie: r[6] || "",
                condicion: r[8] || "",
                ubicacion: r[7] || "",
                resguardante: r[11] || ""
            }))
            .filter(i => i.activo && i.resguardante);

        const resguardantesUnicos = [...new Set(inventoryData.map(i => i.resguardante))].sort();

        const statusDiv = document.getElementById("status");
        statusDiv.classList.remove("hidden");
        statusDiv.innerHTML = `✅ <strong>${inventoryData.length}</strong> bienes cargados • <strong>${resguardantesUnicos.length}</strong> resguardantes.`;

        const select = document.getElementById("resguardanteSelect");
        select.innerHTML = '<option value="">Selecciona un resguardante...</option>';
        resguardantesUnicos.forEach(resg => {
            const option = document.createElement("option");
            option.value = resg;
            option.textContent = resg;
            select.appendChild(option);
        });
    };
    reader.readAsArrayBuffer(file);
});

document.getElementById("resguardanteSelect").addEventListener("change", function() {
    currentResguardante = this.value;
});

function populateSelect() {
    const sel = document.getElementById("resguardanteSelect");
    sel.innerHTML = '<option value="">— Selecciona resguardante —</option>';
    [...new Set(inventoryData.map(i => i.resguardante))].sort().forEach(n => {
        const o = document.createElement("option"); o.value = n; o.textContent = n; sel.appendChild(o);
    });
}

function showGoods() {
    if (!currentResguardante) return alert("Selecciona un resguardante primero.");

    // Filtrar los bienes del resguardante seleccionado
    const bienes = inventoryData.filter(i => i.resguardante === currentResguardante);
    
    const tbody = document.getElementById("tableBody");
    const preview = document.getElementById("preview");
    const tableContainer = document.getElementById("tableContainer");
    const totalDisplay = document.getElementById("totalBienes"); // El nuevo campo

    tbody.innerHTML = "";
    preview.innerHTML = "";

    if (bienes.length > 0) {
        tableContainer.classList.remove("hidden");
        preview.classList.remove("hidden");

        // Actualizar el número total de bienes
        totalDisplay.textContent = bienes.length;

        bienes.forEach(item => {
            // 1. Llenar la Tabla
            const row = `<tr>
                <td>${item.centro}</td>
                <td>${item.activo}</td>
                <td>${item.descripcion}</td>
                <td>${item.condicion}</td>
                <td>${item.ubicacion}</td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } else {
        alert("No se encontraron bienes para este resguardante.");
        tableContainer.classList.add("hidden");
        preview.classList.add("hidden");
        totalDisplay.textContent = "0";
    }

    preview.innerHTML = ""; preview.classList.remove("hidden");
    inventoryData.filter(i => i.resguardante === currentResguardante).slice(0, 10).forEach(item => {
        const div = document.createElement("div");
        div.className = "label";
        div.innerHTML = `
            <img src="LOGO.jpg" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSIyMCI+PHRleHQgeD0iMTAiIHk9IjE1IiBmaWxsPSIjYjkyYzI4IiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iOTAwIj5JTkU8L3RleHQ+PC9zdmc+'">
            <div class="centro">${item.centro}</div>
            <div class="activo">N° ${item.activo}</div>
            <canvas id="bar${item.activo}"></canvas>
            <div class="desc">${item.descripcion}</div>
            <div class="res">${item.resguardante}</div>
        `;
        preview.appendChild(div);

        setTimeout(() => {
            JsBarcode(`#bar${item.activo}`, item.activo, {
                format:"CODE128",
                height:22, 
                width:1.2, 
                fontSize:10});

            QRCode.toCanvas(document.getElementById(`qr${item.activo}`), item.resguardante, {width:42, margin:1});
        }, 50);
    });
}

// ==================== NUEVA FUNCIÓN: PDF RESGUARDO OFICIAL ====================
async function generateResguardoPDF() {
    if (!currentResguardante) return alert("⚠️ Selecciona un resguardante primero.");
    
    const bienes = inventoryData.filter(i => i.resguardante === currentResguardante);
    if (bienes.length === 0) return alert("No hay bienes para este resguardante.");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("portrait", "mm", "letter");

    const fecha = new Date().toLocaleDateString('es-MX', {day:'2-digit', month:'2-digit', year:'numeric'});
    const hora = new Date().toLocaleTimeString('es-MX', {hour:'2-digit', minute:'2-digit'});

    // ==================== CABECERA ====================
    const img = new Image();
    img.src = 'LogoEtiquetas.jpg';

    doc.addImage(img, "JPEG", 15, 11, 25, 8, { align: "left" });

    doc.setFontSize(9);
    doc.text("INSTITUTO NACIONAL ELECTORAL", 105, 15, {align: "center"});
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38);
    doc.text("RESGUARDO DE BIENES DE CONSUMO", 105, 22, {align: "center"});
    
    doc.setFontSize(8);
    doc.setTextColor(0);
    doc.text(`Fecha: ${fecha}     Hora: ${hora}`, 20, 30);
    doc.text("Página: 1", 170, 30);

    // ==================== DATOS DEL RESGUARDANTE ====================
    doc.setFontSize(9);
    doc.text("UNIDAD RESPONSABLE", 20, 40);
    doc.text("CS11", 70, 40);

    doc.text("NOMBRE", 20, 48);
    doc.text(currentResguardante.toUpperCase(), 70, 48);

  //  doc.text("R.F.C.", 20, 55);
  //  doc.text("___________________________", 70, 55);   // puedes agregar columna RFC si quieres

    // ==================== TABLA DE BIENES ====================
    let y = 60;
    doc.setFontSize(7);
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);

    // Encabezados
    doc.rect(15, y-5, 185, 8);
    doc.text("INVENTARIO NACIONAL", 20, y);
    doc.text("DESCRIPCIÓN DEL BIEN", 65, y);
    doc.text("MARCA", 135, y);
    doc.text("SERIE", 170, y);
  //  doc.text("COSTO", 175, y);

    y += 5;

    let totalValor = 0;
    let pagina = 1;
    let items = 0;

    bienes.forEach((item, idx) => {
        if (y > 250 || items>=32 ) {
            doc.addPage();
            pagina +=1;
            items = 0;
            y = 20; 

            doc.addImage(img, "JPEG", 15, 11, 25, 8, { align: "left" });

            doc.setFontSize(9);
            doc.text("INSTITUTO NACIONAL ELECTORAL", 105, 15, {align: "center"});
            doc.setFontSize(14);
            doc.setTextColor(220, 38, 38);
            doc.text("RESGUARDO DE BIENES DE CONSUMO", 105, 22, {align: "center"});
            
            doc.setFontSize(8);
            doc.setTextColor(0);
            doc.text(`Fecha: ${fecha}     Hora: ${hora}`, 20, 30);
            doc.text(`Página: ${pagina}`, 170, 30);

            // ==================== DATOS DEL RESGUARDANTE ====================
            doc.setFontSize(9);
            doc.text("UNIDAD RESPONSABLE", 20, 40);
            doc.text(item.centro, 70, 40);

            doc.text("NOMBRE", 20, 48);
            doc.text(currentResguardante.toUpperCase(), 70, 48);

        //    doc.text("R.F.C.", 20, 55);
        //    doc.text("___________________________", 70, 55);   // puedes agregar columna RFC si quieres

            // ==================== TABLA DE BIENES ====================
            y = 60;
            doc.setFontSize(7);
            doc.setDrawColor(0);
            doc.setLineWidth(0.3);

            // Encabezados
            doc.rect(15, y-5, 185, 8);
          
            doc.text("INVENTARIO NACIONAL", 20, y);
            doc.text("DESCRIPCIÓN DEL BIEN", 65, y);
            doc.text("MARCA", 135, y);
            doc.text("SERIE", 170, y);
   
            y += 5;
        }

        let serie = item.serie.toString(); //Convierte la serie a String
        
        doc.text(item.activo, 20, y+4);
        doc.text(item.descripcion.substring(0, 40) + (item.descripcion.length > 40 ? "..." : ""), 65, y+4);
        doc.text(item.marca || "—", 135, y+4);
        doc.text(serie || "—", 170, y+4); //
        doc.line(15, y+1, 200, y+1);
      //  doc.text("$ 0.00", 175, y+6);   // si tienes columna costo, cámbialo por item.costo
        y += 5;
        totalValor += 0; // aquí puedes sumar si agregas costo
        
        items +=1;
    });

    // Totales
    doc.setFontSize(10);
    doc.text(`Total de Bienes: ${bienes.length}`, 20, y+7);
    //doc.text(`Valor Total: $ 0.00`, 140, y+10);

    // ==================== COMPROMISOS ====================
    y += 16;
    doc.setFontSize(7);
    const compromisos = [
        "• ME COMPROMETO A CUIDAR, HACER BUEN USO Y APROVECHAR EL MOBILIARIO Y EQUIPO QUE TENGO BAJO MI RESGUARDO.",
        "• EN CASO DE RENUNCIA, LICENCIA O CAMBIO DE ADSCRIPCIÓN ME COMPROMETO A HACER ENTREGA DE ESTOS BIENES A MI CARGO.",
        "• ACEPTO QUE EN CASO DE MAL USO O EXTRAVÍO REPONDRÉ CON UNO DE SIMILARES O MEJORES CARACTERÍSTICAS, O HARÉ EL PAGO CORRESPONDIENTE."
    ];
    compromisos.forEach(txt => {
        doc.text(txt, 20, y, {maxWidth: 170});
        y += 4;
    });

    // ==================== FIRMA ====================
    y += 10;
    doc.line(70, y, 150, y);
    doc.text("RESGUARDANTE", 95, y+5);
    doc.setFontSize(10);
    doc.text(currentResguardante.toUpperCase(), 105, y+10, {align: "center"});

    // Guardar
    doc.save(`RESGUARDO_${currentResguardante.split(" ")[0]}_${bienes.length}bienes_${fecha}.pdf`);
    
   // alert(`📄 PDF Resguardo generado correctamente\n${bienes.length} bienes incluidos`);
}

async function generatePDF() {
    if (!currentResguardante) return alert("Selecciona un resguardante primero.");
    
    const bienes = inventoryData.filter(i => i.resguardante === currentResguardante);
    if (bienes.length === 0) return alert("No hay bienes para este resguardante.");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });

    // Configuración de grilla para 20 etiquetas (3 columnas x 8 filas)
    const w = 60; // Ancho etiqueta
    const h = 25; // Alto etiqueta
    const startX = 10;
    const startY = 15;
    const gapX = 4;
    const gapY = 4;

    const img = new Image();
    img.src = 'LogoEtiquetas.jpg';

    for (let i = 0; i < bienes.length; i++) {
        const item = bienes[i];
        const indexOnPage = i % 27; //numero de etiquetas por hoja
        const col = indexOnPage % 3;
        const row = Math.floor(indexOnPage / 3);

        if (i > 0 && indexOnPage === 0) {
            doc.addPage();
        }

        const x = startX + col * (w + gapX);
        const y = startY + row * (h + gapY);

        // Contorno de la etiqueta
        doc.setDrawColor(30, 64, 175); // Azul oscuro
        doc.setLineWidth(0.3);
        doc.rect(x, y, w, h);
        
        //Logotipo
        doc.addImage(img, "JPEG", x + 2, y + 2, 15, 5, { align: "left" });

        doc.setFontSize(8);
       // doc.setFont('Arial', 'normal')
        doc.setTextColor(0, 0, 0);
        doc.text("Bien de Consumo", x + (w/2), y + 5, { align: "center" });

        // Centro y Activo (Textos)
        doc.setFontSize(7);
        doc.setFont('Arial', 'bold')
        doc.setTextColor(30, 64, 175);
        doc.text(item.centro, x + (w-3), y + 5, { align: "right" });

        doc.setFontSize(7);
       // doc.setFont('Arial', 'normal')
        doc.setTextColor(0, 0, 0);
        doc.text(item.activo, x + (w/2), y + 9, { align: "center" });

        // ----------------------------------------------------
        // GENERAR CÓDIGO DE BARRAS EN LA ETIQUETA
        // ----------------------------------------------------
        const canvasBar = document.createElement("canvas");
        
        JsBarcode(canvasBar, item.activo, {
            format: "CODE128",
            lineColor: "#000000",
            width: 1.8,           // ← puedes ajustar
            height: 33,           // ← puedes ajustar
            margin: 2,
            displayValue: false
        });

        // 3. Convertir a imagen
        const imgData = canvasBar.toDataURL("image/png");

        // 4. Poner en el PDF
        doc.addImage(imgData, "PNG", x + 4, y + 11, w - 8, 7);

        // Descripción
        doc.setFontSize(7);
        const splitDesc = doc.splitTextToSize(item.descripcion, w - 5); 
        doc.text(splitDesc, x + (w/2), y + 21, { align: "center" });

        // ----------------------------------------------------
        // GENERAR CÓDIGO QR EN LA ETIQUETA (Asíncrono)
        // ----------------------------------------------------
      /*  try {
            // QRCode.toDataURL genera un string base64
            const qrDataUrl = await QRCode.toDataURL(item.resguardante, { 
                margin: 0,
                errorCorrectionLevel: 'M' 
            });
            // Posicionamos el QR en la esquina inferior derecha
            doc.addImage(qrDataUrl, "PNG", x + w - 12, y + h - 12, 10, 10);
        } catch (err) {
            console.error("Error generando QR para", item.activo, err);
        }*/

        // Nombre del Resguardante al final
      //  doc.setFontSize(6);
       // doc.text(item.resguardante, x + (w/2), y + h - 2,  { align: "center" });
    }

    doc.save(`INE_${currentResguardante.split(" ")[0]}_${bienes.length}bienes.pdf`);
}
/*
function exportToExcel() {
    if (!currentResguardante) return alert("Selecciona un resguardante");
    const data = inventoryData.filter(i => i.resguardante === currentResguardante)
        .map(i => ({
            "Centro Costo": i.centro,
            "N° Activo": i.activo,
            "Descripción": i.descripcion,
            "Condición": i.condicion,
            "Ubicación": i.ubicacion,
            "Resguardante": i.resguardante
        }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Bienes");
    XLSX.writeFile(wb, `INE_Bienes_${currentResguardante.split(" ")[0]}.xlsx`);
   // alert("📥 Excel descargado");
}*/

//<!--<button onclick="exportToExcel()" class="btn btn-green">📥 Exportar Excel</button>-->

//window.onload = () => console.log("%c✅ Sistema INE completamente corregido y listo", "color:#10b981; font-size:16px");