package com.example.natura;

import android.content.Intent;
import android.os.Bundle;
import android.view.inputmethod.EditorInfo;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.chip.Chip;

public class SearchActivity extends AppCompatActivity {

    private EditText etSearchInput;
    private ImageButton btnBack;
    private Chip chipMenta, chipManzanilla, chipEucalipto, chipAloe;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        androidx.activity.EdgeToEdge.enable(this);
        setContentView(R.layout.activity_search);

        androidx.core.view.ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.mainSearch), (v, insets) -> {
            androidx.core.graphics.Insets systemBars = insets.getInsets(androidx.core.view.WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        etSearchInput = findViewById(R.id.etSearchInput);
        btnBack = findViewById(R.id.btnBackSearch);
        chipMenta = findViewById(R.id.chipMenta);
        chipManzanilla = findViewById(R.id.chipManzanilla);
        chipEucalipto = findViewById(R.id.chipEucalipto);
        chipAloe = findViewById(R.id.chipAloe);

        btnBack.setOnClickListener(v -> finish());

        // Lógica de búsqueda al presionar el teclado
        etSearchInput.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_SEARCH || actionId == EditorInfo.IME_ACTION_DONE) {
                realizarBusqueda(etSearchInput.getText().toString().trim());
                return true;
            }
            return false;
        });

        // Configurar clics en las sugerencias (Chips)
        chipMenta.setOnClickListener(v -> realizarBusqueda("Menta"));
        chipManzanilla.setOnClickListener(v -> realizarBusqueda("Manzanilla"));
        chipEucalipto.setOnClickListener(v -> realizarBusqueda("Eucalipto"));
        chipAloe.setOnClickListener(v -> realizarBusqueda("Aloe Vera"));
    }

    private void realizarBusqueda(String query) {
        if (!query.isEmpty()) {
            Intent intent = new Intent(SearchActivity.this, ResultActivity.class);
            intent.putExtra("plant_name", query);
            intent.putExtra("from_history", true); 
            intent.putExtra("search_by_name", true); // SEÑAL: Buscar por nombre común
            startActivity(intent);
        } else {
            Toast.makeText(this, "Por favor, escribe el nombre de una planta", Toast.LENGTH_SHORT).show();
        }
    }
}
