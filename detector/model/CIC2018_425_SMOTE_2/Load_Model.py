import tensorflow as tf
import pickle

#..\\..\\CIC2018_425_SMOTE.h5 -> 파일 있는 경로로 수정 가능.
loaded_model = tf.keras.models.load_model("CIC2018_425_SMOTE.h5")

# ..\\..\\scaler.pkl -> 파일 있는 경로로 수정 가능
with open("scaler.pkl", "rb") as f:
    loaded_scaler = pickle.load(f)

# ..\\..\\encoder.pkl -> 파일 있는 경로로 수정 가능
with open("encoder.pkl", "rb") as f:
    loaded_encoder = pickle.load(f)


import numpy as np
import pandas as pd
import os

# Set the path to the folder containing your CSV files
folder_path = "C:\\dataset\\CIC2018_erased\\test"

# Get a list of all CSV files in the folder
csv_files = [f for f in os.listdir(folder_path) if f.endswith('.csv')]

# Initialize an empty list to store DataFrames
dataframes = []

# Iterate through each CSV file, read it, and append the DataFrame to the list
for file in csv_files:
    file_path = os.path.join(folder_path, file)
    df = pd.read_csv(file_path, low_memory=False)
    dataframes.append(df)

# Concatenate all DataFrames in the list
data = pd.concat(dataframes, ignore_index=True)

# Drop the first four columns
data = data.iloc[:, 4:]
data['Timestamp'] = pd.to_datetime(data['Timestamp'], format="%d/%m/%Y %H:%M:%S")
data['Timestamp'] = pd.to_datetime(data['Timestamp']).astype(np.int64) // 10**9

# Replace infinity values with NaN
data.replace([np.inf, -np.inf], np.nan, inplace=True)

# Remove rows containing NaN values
data = data.dropna()


### 위 코드는 폴더 내 .csv 파일 읽어서 하나의 daraframe으로 정리해서 
### X_new데이터로 중복된 header들 지워서 데이터 정리

# Preprocess the input data using the loaded StandardScaler
X_new = data.drop('Label', axis=1)
X_new = loaded_scaler.transform(X_new)

# Make predictions using the loaded model
y_pred = loaded_model.predict(X_new)

# Convert the one-hot encoded predicted labels back to their original form
y_pred_labels = loaded_encoder.inverse_transform(y_pred)

# Convert X_new back to a DataFrame with the original columns
X_new = pd.DataFrame(loaded_scaler.inverse_transform(X_new), columns=data.columns.drop('Label'))

# Add the predicted labels to the DataFrame
X_new['Predicted_Label'] = y_pred_labels

# Display the DataFrame with the attack types and predictions
print(X_new)

X_new.to_csv('output.csv', index=False)
