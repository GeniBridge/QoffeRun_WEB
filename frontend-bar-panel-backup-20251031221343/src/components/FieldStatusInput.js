import React from "react";

export default function FieldStatusInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  valid,
  invalid,
  ...props
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: "10px 38px 10px 12px",
            border: `2px solid ${valid ? '#28a745' : invalid ? '#dc3545' : '#ccc'}`,
            borderRadius: 6,
            outline: "none",
            fontSize: 16,
            background: "#fff",
            transition: "border-color 0.2s",
            boxSizing: "border-box"
          }}
          {...props}
        />
        {valid && (
          <span style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#28a745",
            fontSize: 20
          }}>
            &#10003;
          </span>
        )}
        {invalid && (
          <span style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#dc3545",
            fontSize: 20
          }}>
            &#9888;
          </span>
        )}
      </div>
    </div>
  );
}
