import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import "moment/locale/es"; // Importa los locales de Moment

// Configurar Moment para usar el idioma español
moment.locale("es");

export const generarReporteEmpleadosPDF = (
  empleados,
  consulta = "Empleados"
) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "legal",
  });

  const logoUrl = `${window.location.origin}/logo.png`;
  const pageWidth = doc.internal.pageSize.width;

  const fechaActual = moment().format("DD [de] MMMM [de] YYYY");

  // Insertar logo
  doc.addImage(logoUrl, "PNG", 30, 10, 200, 100);

  // Título
  const azulClaro = [0, 123, 255];
  doc.setFontSize(14);
  doc.setTextColor(...azulClaro);
  doc.setFont("helvetica", "bold");
  doc.text(`Reporte de ${consulta} - ${fechaActual}`, pageWidth / 2, 70, {
    align: "center",
  });

  // Encabezados de la tabla
  const tableColumns = [
    "No.",
    "Nombre",
    "DPI",
    "Teléfono",
    "Cargo",
    "Banco",
    "Cuenta",
    "Sueldo",
    "Bonificación",
    "Fecha de Inicio",
    "Fecha de Finalización",
  ];

  // Cuerpo de la tabla
  const tableRows = empleados.map((empleado, index) => [
    index + 1,
    empleado.nombre,
    empleado.dpi,
    empleado.telefono,
    empleado.cargo,
    empleado.banco,
    empleado.cuenta,
    `Q${empleado.sueldo.toFixed(2)}`,
    `Q${empleado.bonificacion.toFixed(2)}`,
    moment(empleado.fechaInicio).format("DD/MM/YYYY"),
    moment(empleado.fechaFinalizacion).format("DD/MM/YYYY"),
  ]);

  // Configurar la tabla
  doc.autoTable({
    head: [tableColumns],
    body: tableRows,
    startY: 130, // Ajusta este valor para mover la tabla hacia abajo o hacia arriba
    theme: "grid",
    headStyles: {
      fillColor: azulClaro,
      fontSize: 10,
      halign: "center",
      textColor: [255, 255, 255],
    },
    bodyStyles: { fontSize: 11 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 150 },
      2: { cellWidth: 90 },
      3: { cellWidth: 70 },
      4: { cellWidth: 150 },
      5: { cellWidth: 70 },
      6: { cellWidth: 90 },
      7: { cellWidth: 70 },
      8: { cellWidth: 70 },
      9: { cellWidth: 70 },
      10: { cellWidth: 70 },
    },
    margin: { top: 100 },
    showHead: "everyPage",
  });

  // Pie de página con el número de página
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerText = `Página ${i} de ${totalPages}`;
    doc.setFontSize(11);
    doc.text(footerText, pageWidth / 2, doc.internal.pageSize.height - 20, {
      align: "center",
    });
  }

  // Crear el archivo PDF y abrirlo en una nueva ventana
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);

  const nuevaVentana = window.open(pdfUrl, "_blank");
  if (nuevaVentana) {
    nuevaVentana.onload = () => {
      URL.revokeObjectURL(pdfUrl); // Liberar memoria cuando se haya cargado
    };
  }
};
