package com.example.natura;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.android.volley.Request;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class LoginActivity extends AppCompatActivity {

    private EditText etEmail, etPassword;
    private Button btnLogin;
    private TextView tvRegister;

    // Usando la configuración global
    private static final String URL_LOGIN = Config.BASE_URL + "login.php";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        androidx.activity.EdgeToEdge.enable(this);

        // PERSISTENCIA DE SESIÓN: Verificar si ya existe un ID de usuario guardado
        SharedPreferences preferences = getSharedPreferences("sesion", Context.MODE_PRIVATE);
        String idUsuario = preferences.getString("id_usuario", null);

        if (idUsuario != null) {
            // Si ya hay una sesión activa, vamos directamente al Main
            navigateToMain();
            return; // Detenemos el resto del onCreate para evitar mostrar el login
        }

        setContentView(R.layout.activity_login);

        // Ajuste de padding para no tapar la barra de notificaciones
        androidx.core.view.ViewCompat.setOnApplyWindowInsetsListener(findViewById(android.R.id.content), (v, insets) -> {
            androidx.core.graphics.Insets systemBars = insets.getInsets(androidx.core.view.WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        btnLogin = findViewById(R.id.btnLogin);
        tvRegister = findViewById(R.id.tvRegister);

        btnLogin.setOnClickListener(v -> {
            String email = etEmail.getText().toString().trim();
            String password = etPassword.getText().toString().trim();

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(LoginActivity.this, "Por favor complete todos los campos", Toast.LENGTH_SHORT).show();
            } else {
                validarUsuario(email, password);
            }
        });

        tvRegister.setOnClickListener(v -> {
            Intent intent = new Intent(LoginActivity.this, RegisterActivity.class);
            startActivity(intent);
        });
    }

    private void validarUsuario(String email, String password) {
        StringRequest stringRequest = new StringRequest(Request.Method.POST, URL_LOGIN,
                response -> {
                    try {
                        // Esperamos que el servidor devuelva un JSON con el ID
                        JSONObject jsonObject = new JSONObject(response);
                        if (jsonObject.getString("status").equals("success")) {
                            
                            // GUARDAR SESIÓN (ID, NOMBRE Y CORREO)
                            String idUsuario = jsonObject.getString("id");
                            String nombre = jsonObject.getString("nombre");
                            
                            SharedPreferences preferences = getSharedPreferences("sesion", Context.MODE_PRIVATE);
                            SharedPreferences.Editor editor = preferences.edit();
                            editor.putString("id_usuario", idUsuario);
                            editor.putString("nombre_usuario", nombre);
                            editor.putString("correo_usuario", email); // El email que ingresó el usuario
                            editor.apply();

                            Toast.makeText(this, "¡Bienvenido, " + nombre + "!", Toast.LENGTH_SHORT).show();
                            navigateToMain();
                        } else {
                            Toast.makeText(this, "Correo o contraseña incorrectos", Toast.LENGTH_SHORT).show();
                        }
                    } catch (JSONException e) {
                        Log.e("LOGIN_ERROR", "Respuesta no es JSON válido: " + response);
                        Toast.makeText(this, "Error en el formato de respuesta del servidor", Toast.LENGTH_SHORT).show();
                    }
                },
                error -> Toast.makeText(this, "Error de conexión: " + error.getMessage(), Toast.LENGTH_SHORT).show()) {
            @Override
            protected Map<String, String> getParams() {
                Map<String, String> params = new HashMap<>();
                params.put("correo", email);
                params.put("password", password);
                return params;
            }
        };

        Volley.newRequestQueue(this).add(stringRequest);
    }

    private void navigateToMain() {
        Intent intent = new Intent(LoginActivity.this, MainActivity.class);
        startActivity(intent);
        finish();
    }
}