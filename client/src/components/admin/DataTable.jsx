function DataTable({
  columns,
  data,
  renderActions,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <table className="w-full">
        <thead className="bg-slate-800">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="p-4 text-left font-semibold"
              >
                {column.label}
              </th>
            ))}

            {renderActions && (
              <th className="p-4 text-center">
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={
                  columns.length +
                  (renderActions ? 1 : 0)
                }
                className="p-8 text-center text-slate-400"
              >
                No Data Found
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={item._id}
                className="border-t border-slate-800 hover:bg-slate-800 transition"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="p-4"
                  >
                    {column.render
                      ? column.render(item)
                      : item[column.key]}
                  </td>
                ))}

                {renderActions && (
                  <td className="p-4 text-center">
                    {renderActions(item)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;