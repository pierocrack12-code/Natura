package com.example.natura;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import java.util.HashMap;
import java.util.Map;

public class RegisterActivity extends AppCompatActivity {

    private EditText etName, etEmail, etPassword;
    private Button btnRegister;
    private TextView tvLogin;

    // Usando la configuración global
    private static final String URL_REGISTRO = Config.BASE_URL + "registro.php";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        androidx.activity.EdgeToEdge.enable(this);
        setContentView(R.layout.activity_register);

        // Ajuste de padding para no tapar la barra de notificaciones
        androidx.core.view.ViewCompat.setOnApplyWindowInsetsListener(findViewById(android.R.id.content), (v, insets) -> {
            androidx.core.graphics.Insets systemBars = insets.getInsets(androidx.core.view.WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        etName = findViewById(R.id.etName);
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        btnRegister = findViewById(R.id.btnRegister);
        tvLogin = findViewById(R.id.tvLogin);

        btnRegister.setOnClickListener(v -> {
            String name = etName.getText().toString().trim();
            String email = etEmail.getText().toString().trim();
            String password = etPassword.getText().toString().trim();

            if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
                Toast.makeText(RegisterActivity.this, "Por favor complete todos los campos", Toast.LENGTH_SHORT).show();
            } else {
                registrarUsuario(name, email, password);
            }
        });

        tvLogin.setOnClickListener(v -> {
            finish();
        });
    }

    private void registrarUsuario(String nombre, String email, String password) {
        StringRequest stringRequest = new StringRequest(Request.Method.POST, URL_REGISTRO,
                response -> {
                    if (response.contains("success")) {
                        Toast.makeText(this, "Cuenta creada exitosamente", Toast.LENGTH_SHORT).show();
                        finish(); // Regresa al Login
                    } else if (response.contains("exists")) {
                        Toast.makeText(this, "El correo ya está registrado", Toast.LENGTH_SHORT).show();
                    } else {
                        Toast.makeText(this, "Error al registrar: " + response, Toast.LENGTH_SHORT).show();
                    }
                },
                error -> Toast.makeText(this, "Error de conexión: " + error.getMessage(), Toast.LENGTH_SHORT).show()) {
            @Override
            protected Map<String, String> getParams() {
                Map<String, String> params = new HashMap<>();
                params.put("nombre", nombre);
                params.put("correo", email);
                params.put("password", password);
                return params;
            }
        };

        RequestQueue requestQueue = Volley.newRequestQueue(this);
        requestQueue.add(stringRequest);
    }

    private void navigateToMain() {
        Intent intent = new Intent(RegisterActivity.this, MainActivity.class);
        startActivity(intent);
        finish();
    }
}