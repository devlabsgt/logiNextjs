import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";

const generarInformeEmpleadoPDF = (empleado) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

  const logoUrl = `${window.location.origin}/logo.png`;
  const pageWidth = doc.internal.pageSize.width;

  const fechaActual = moment().format("DD [de] MMMM [de] YYYY");

  // Insertar logo centrado
  const logoWidth = 200;
  const logoHeight = 100;
  const logoX = (pageWidth - logoWidth) / 2;
  doc.addImage(logoUrl, "PNG", logoX, 10, logoWidth, logoHeight);

  // Título
  const azulClaro = [0, 123, 255];
  doc.setFontSize(14);
  doc.setTextColor(...azulClaro);
  doc.setFont("helvetica", "bold");
  doc.text(`Informe de datos de empleado municipal`, pageWidth / 2, 140, {
    align: "center",
  });

  // Información del empleado
  const infoEmpleado = [
    ["Nombre", empleado.nombre],
    ["Teléfono", empleado.telefono],
    [
      "Fecha de Nacimiento",
      moment(empleado.fechaNacimiento).format("DD/MM/YYYY"),
    ],
    ["Dirección", empleado.direccion],
    ["DPI", empleado.dpi],
    ["IGSS", empleado.igss],
    ["NIT", empleado.nit],
    ["Cargo", empleado.cargo],
    ["Banco", empleado.banco],
    ["Cuenta", empleado.cuenta],
    ["Sueldo", `Q ${parseFloat(empleado.sueldo).toFixed(2)}`],
    ["Bonificación", `Q ${parseFloat(empleado.bonificacion).toFixed(2)}`],
    ["Fecha de Inicio", moment(empleado.fechaInicio).format("DD/MM/YYYY")],
    [
      "Fecha de Finalización",
      moment(empleado.fechaFinalizacion).format("DD/MM/YYYY"),
    ],
    ["Contrato No.", empleado.contratoNo],
    ["Renglón", empleado.renglon],
  ];

  // Configurar la tabla
  doc.autoTable({
    head: [["Campo", "Detalle"]],
    body: infoEmpleado,
    startY: 160,
    theme: "grid",
    headStyles: {
      fillColor: azulClaro,
      fontSize: 12,
      halign: "center", // Centra el texto en las celdas de los encabezados
      textColor: [255, 255, 255],
    },
    bodyStyles: {
      fontSize: 14,
    },
    columnStyles: {
      0: { halign: "left", fontStyle: "bold" }, // Primera columna
      1: { halign: "center", fontStyle: "normal" }, // Segunda columna
    },
    margin: { top: 160, left: 100, right: 40 }, // Márgenes laterales
    showHead: "firstPage",
  });

  // Agregar línea para la firma
  const signatureY = doc.internal.pageSize.height - 100;
  const lineWidth = 200;
  const lineX = (pageWidth - lineWidth) / 2;
  doc.setLineWidth(1);
  doc.line(lineX, signatureY, lineX + lineWidth, signatureY);

  // Agregar nombre y cargo centrados
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(
    "Licda. Katty Anabelli Martínez López",
    pageWidth / 2,
    signatureY + 15,
    { align: "center" }
  );
  doc.text(
    "Coordinadora de la Oficina Municipal de ",
    pageWidth / 2,
    signatureY + 30,
    { align: "center" }
  );
  doc.text("Recursos Humanos", pageWidth / 2, signatureY + 45, {
    align: "center",
  });

  // Pie de página con la fecha actual
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerText = `Fecha de emisión: ${fechaActual}`;
    doc.setFontSize(12);
    doc.text(footerText, pageWidth / 2, doc.internal.pageSize.height - 30, {
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

export default generarInformeEmpleadoPDF;
