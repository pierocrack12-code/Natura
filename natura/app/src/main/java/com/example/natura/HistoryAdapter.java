package com.example.natura;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

public class HistoryAdapter extends RecyclerView.Adapter<HistoryAdapter.ViewHolder> {

    private List<HistoryItem> historyList;

    public HistoryAdapter(List<HistoryItem> historyList) {
        this.historyList = historyList;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_history, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        HistoryItem item = historyList.get(position);
        holder.tvPlantName.setText(item.getPlantName());
        holder.tvDate.setText(item.getDate());

        if (item.getImageBase64() != null && !item.getImageBase64().isEmpty()) {
            byte[] decodedString = Base64.decode(item.getImageBase64(), Base64.DEFAULT);
            Bitmap decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
            holder.ivPlant.setImageBitmap(decodedByte);
        }
    }

    @Override
    public int getItemCount() {
        return historyList.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        ImageView ivPlant;
        TextView tvPlantName, tvDate;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            ivPlant = itemView.findViewById(R.id.ivHistoryImage);
            tvPlantName = itemView.findViewById(R.id.tvHistoryPlantName);
            tvDate = itemView.findViewById(R.id.tvHistoryDate);
        }
    }
}