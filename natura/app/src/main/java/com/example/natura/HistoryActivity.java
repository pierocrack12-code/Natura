package com.example.natura;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class HistoryActivity extends AppCompatActivity {

    private RecyclerView rvHistory;
    private HistoryAdapter adapter;
    private List<HistoryItem> historyList;

    // Usando la configuración global
    private static final String URL_HISTORIAL = Config.BASE_URL + "obtener_historial.php?id_usuario=";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        androidx.activity.EdgeToEdge.enable(this);
        setContentView(R.layout.activity_history);

        androidx.core.view.ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.mainHistory), (v, insets) -> {
            androidx.core.graphics.Insets systemBars = insets.getInsets(androidx.core.view.WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        rvHistory = findViewById(R.id.rvHistory);
        historyList = new ArrayList<>();
        adapter = new HistoryAdapter(historyList);

        rvHistory.setLayoutManager(new LinearLayoutManager(this));
        rvHistory.setAdapter(adapter);

        findViewById(R.id.btnBackHistory).setOnClickListener(v -> finish());

        // Recuperar el ID del usuario de la sesión actual
        SharedPreferences preferences = getSharedPreferences("sesion", Context.MODE_PRIVATE);
        String idUsuario = preferences.getString("id_usuario", "1"); 

        cargarHistorial(idUsuario);
    }

    private void cargarHistorial(String idUsuario) {
        RequestQueue queue = Volley.newRequestQueue(this);
        String url = URL_HISTORIAL + idUsuario;

        StringRequest stringRequest = new StringRequest(Request.Method.GET, url,
                response -> {
                    try {
                        Log.d("SERVER_RESPONSE", response);
                        JSONArray jsonArray = new JSONArray(response);
                        historyList.clear();
                        for (int i = 0; i < jsonArray.length(); i++) {
                            JSONObject obj = jsonArray.getJSONObject(i);
                            historyList.add(new HistoryItem(
                                    obj.getString("id_historial"),
                                    obj.getString("nombre_comun"),
                                    obj.getString("nombre_cientifico"),
                                    obj.getString("fecha_escaneo"),
                                    obj.getString("foto_capturada")
                            ));
                        }
                        adapter.notifyDataSetChanged();
                        
                        if (historyList.isEmpty()) {
                            Toast.makeText(this, "Aún no tienes escaneos guardados", Toast.LENGTH_SHORT).show();
                        }
                    } catch (JSONException e) {
                        Log.e("JSON_ERROR", "No es JSON válido: " + response);
                        Toast.makeText(this, "Error: El servidor respondió algo extraño", Toast.LENGTH_LONG).show();
                    }
                },
                error -> {
                    String errorMsg = "Error de red";
                    if (error.networkResponse != null) {
                        errorMsg = "Error " + error.networkResponse.statusCode + " (Archivo no encontrado o error en PHP)";
                    } else if (error.getMessage() != null) {
                        errorMsg = error.getMessage();
                    }
                    Log.e("HISTORY_ERROR", errorMsg);
                    Toast.makeText(this, errorMsg + "\nVerifica IP: " + Config.IP_SERVER, Toast.LENGTH_LONG).show();
                }
        );

        queue.add(stringRequest);
    }
}