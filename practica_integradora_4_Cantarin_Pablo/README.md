# CUARTA PRACTICA INTEGRADORA

### **VISTA CAMBIO ROL**

```
GET: localhost:8080/api/users/premium/{uid}
```

### **CAMBIOS EN MODELO DE USUAIRO**

```
const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: { type: String, unique: true },
  age: Number,
  password: String,
  cart: String,
  rol: { type: String, default: "user" },
  documents: {
    type: [
      {
        name_document: { type: String },
        reference: { type: String },
      },
    ],
    default: [],
  },
  last_connection: { type: String, default: "" },
});
```

### **VISTA PARA CARGAR DOCUMENTACION**

```
GET: localhost:8080/api/users/documents
```

### **POST PARA CARGAR DOCUMENTACION**

> Requiere tres archivos

```
POST: localhost:800/api/users/documents
```