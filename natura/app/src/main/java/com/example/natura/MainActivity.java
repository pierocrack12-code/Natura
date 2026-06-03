package com.example.natura;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.floatingactionbutton.ExtendedFloatingActionButton;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Aplicar el tema guardado ANTES de super.onCreate
        android.content.SharedPreferences pref = getSharedPreferences("sesion", android.content.Context.MODE_PRIVATE);
        int savedTheme = pref.getInt("tema_app", androidx.appcompat.app.AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM);
        androidx.appcompat.app.AppCompatDelegate.setDefaultNightMode(savedTheme);

        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);
        
        // Ajustar el padding para que el contenido no quede debajo de las barras del sistema
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        // Configurar Buscador Real
        android.widget.EditText etSearch = findViewById(R.id.etSearchPlant);
        if (etSearch != null) {
            etSearch.setOnEditorActionListener((v, actionId, event) -> {
                if (actionId == android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH ||
                    actionId == android.view.inputmethod.EditorInfo.IME_ACTION_DONE) {
                    
                    String query = etSearch.getText().toString().trim();
                    if (!query.isEmpty()) {
                        Intent intent = new Intent(MainActivity.this, ResultActivity.class);
                        intent.putExtra("plant_name", query);
                        intent.putExtra("from_history", true);
                        intent.putExtra("search_by_name", true); // SEÑAL: Buscar por nombre común
                        startActivity(intent);
                        etSearch.setText("");
                    } else {
                        Toast.makeText(MainActivity.this, "Escribe el nombre de una planta", Toast.LENGTH_SHORT).show();
                    }
                    return true;
                }
                return false;
            });
        }

        // Configurar botón de Escaneo
        ExtendedFloatingActionButton btnScan = findViewById(R.id.btnStartRecognition);
        if (btnScan != null) {
            btnScan.setOnClickListener(v -> {
                Intent intent = new Intent(MainActivity.this, CameraActivity.class);
                startActivity(intent);
            });
        }

        // Configurar Navegación Inferior (Bottom Navigation)
        BottomNavigationView bottomNav = findViewById(R.id.bottom_navigation);
        
        // EVITAR EL EMPUJE: Desactivar el padding automático del sistema para esta barra
        bottomNav.setOnApplyWindowInsetsListener(null);
        bottomNav.setPadding(0,0,0,0);

        bottomNav.setOnItemSelectedListener(item -> {
            int itemId = item.getItemId();
            if (itemId == R.id.nav_home) {
                // Ya estamos en Inicio
                return true;
            } else if (itemId == R.id.nav_history) {
                // Abrir pantalla de Historial
                Intent intent = new Intent(MainActivity.this, HistoryActivity.class);
                startActivity(intent);
                return true;
            } else if (itemId == R.id.nav_settings) {
                // Abrir pantalla de Ajustes
                Intent intent = new Intent(MainActivity.this, SettingsActivity.class);
                startActivity(intent);
                return true;
            } else if (itemId == R.id.nav_search) {
                // Abrir pantalla de Búsqueda Dedicada
                Intent intent = new Intent(MainActivity.this, SearchActivity.class);
                startActivity(intent);
                return true;
            }
            return false;
        });

        // --- LÓGICA PARA PROBAR CONEXIÓN (OPCIONAL) ---
        probarConexionDB();
    }

    private void probarConexionDB() {
        String miIpComputadora = "172.17.2.26"; 
        String url = "http://" + miIpComputadora + "/natura_api/buscar_usuario.php?id=1";
        RequestQueue queue = Volley.newRequestQueue(this);
        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.GET, url, null,
            response -> {
                try {
                    if (!response.has("error")) {
                        String usuario = response.optString("nombre", "Conectado"); 
                        Toast.makeText(this, "¡Bienvenido de nuevo, " + usuario + "!", Toast.LENGTH_SHORT).show();
                    }
                } catch (Exception e) {
                    Log.e("DB_JSON", "Error al procesar JSON: " + e.getMessage());
                }
            },
            error -> Log.e("DB_PROBA", "Sin conexión inicial o servidor apagado")
        );
        queue.add(jsonObjectRequest);
    }
}