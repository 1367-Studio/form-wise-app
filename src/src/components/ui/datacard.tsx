"use client";

type Field<T extends object> = {
  key: keyof T | string;
  label?: string;
  render?: (item: T) => React.ReactNode;
};

type DataCardProps<T extends object> = {
  data: T[];
  fields: Field<T>[];
  className?: string;
};

export function DataCard<T extends object>({
  data,
  fields,
  className = "",
}: DataCardProps<T>) {
  return (
    <div className={`flex flex-col gap-4 md:hidden ${className}`}>
      {data.map((item, index) => (
        <div
          key={index}
          className="border rounded-xl p-4 shadow bg-white flex flex-col gap-2"
        >
          {fields.map((field, i) => {
            const content = field.render
              ? field.render(item)
              : field.key in item
                ? (item[field.key as keyof T] as React.ReactNode)
                : null;

            const isActionField = field.key === "actions";

            return (
              <div key={i} className="text-sm">
                {!isActionField && field.label && (
                  <span className="font-semibold">{field.label}: </span>
                )}
                {content}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
