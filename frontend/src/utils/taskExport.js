const exportColumns = [
  ['title', 'Title'],
  ['description', 'Description'],
  ['status', 'Status'],
  ['priority', 'Priority'],
  ['category', 'Category'],
  ['due_date', 'Due Date'],
  ['reminder_at', 'Reminder'],
  ['estimated_hours', 'Estimated Hours']
];

const formatValue = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\s+/g, ' ').trim();
};

const escapeCsvValue = (value) => {
  const text = formatValue(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const escapeHtml = (value) => (
  formatValue(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
);

const buildFileName = (extension) => {
  const date = new Date().toISOString().slice(0, 10);
  return `taskmaster-tasks-${date}.${extension}`;
};

export const exportTasksToCsv = (tasks) => {
  const header = exportColumns.map(([, label]) => escapeCsvValue(label)).join(',');
  const rows = tasks.map((task) => (
    exportColumns.map(([key]) => escapeCsvValue(task[key])).join(',')
  ));
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = buildFileName('csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const exportTasksToPdf = (tasks) => {
  const printWindow = window.open('', '_blank', 'width=1100,height=800');
  if (!printWindow) return false;

  const rows = tasks.map((task) => `
    <tr>
      ${exportColumns.map(([key]) => `<td>${escapeHtml(task[key])}</td>`).join('')}
    </tr>
  `).join('');

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>TaskMaster Tasks</title>
        <style>
          body { color: #111827; font-family: Arial, sans-serif; margin: 32px; }
          h1 { font-size: 24px; margin: 0; }
          p { color: #4b5563; margin: 6px 0 24px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #d1d5db; font-size: 12px; padding: 8px; text-align: left; vertical-align: top; }
          th { background: #eff6ff; color: #1e3a8a; text-transform: uppercase; }
          tr:nth-child(even) td { background: #f9fafb; }
          @media print { body { margin: 18px; } }
        </style>
      </head>
      <body>
        <h1>TaskMaster Tasks</h1>
        <p>${tasks.length} task${tasks.length === 1 ? '' : 's'} exported on ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>${exportColumns.map(([, label]) => `<th>${escapeHtml(label)}</th>`).join('')}</tr>
          </thead>
          <tbody>${rows || `<tr><td colspan="${exportColumns.length}">No tasks available</td></tr>`}</tbody>
        </table>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  return true;
};
