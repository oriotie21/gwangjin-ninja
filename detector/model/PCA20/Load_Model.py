from keras.models import load_model
import pickle
import os

# 저장한 파일들이 있는 디렉토리
dir_name = "/home/oriotie/gwangjin_ninja/detector/model/PCA20"

# Load model
loaded_model = load_model(os.path.join(dir_name, 'my_model.h5'))

# Load LabelEncoder
with open(os.path.join(dir_name, 'label_encoder.pkl'), 'rb') as f:
    loaded_encoder = pickle.load(f)

# Load OneHotEncoder
with open(os.path.join(dir_name, 'one_hot_encoder.pkl'), 'rb') as f:
    one_hot_encoder = pickle.load(f)

# Load StandardScaler
with open(os.path.join(dir_name, 'scaler.pkl'), 'rb') as f:
    loaded_scaler = pickle.load(f)

# Load PCA
with open(os.path.join(dir_name, 'pca.pkl'), 'rb') as f:
    pca = pickle.load(f)



import numpy as np
import pandas as pd
import os

from fastapi import FastAPI
from typing import List
from pydantic import BaseModel
from io import StringIO

class Inputs(BaseModel):
    instances: List[List[str]]

#ninput("press any key to continue...")
# Set the path to the folder containing your CSV files
folder_path = "/home/oriotie/gwangjin_ninja/detector"
samplefile_name = "sample.csv"
sample_folder_path = os.path.join(folder_path,"model/dataset")
csv_files = ["1.pcap_Flow.csv"]
# Get a list of all CSV files in the folder
#csv_files = [f for f in os.listdir(folder_path) if f.endswith('.csv')]

#get original colum name list from sample csv
orig_column_list = list()
with open(os.path.join(sample_folder_path,samplefile_name)) as file:
    data = pd.read_csv(file)
    orig_column_list = data.columns.tolist()


# Initialize an empty list to store DataFrames

app = FastAPI()
@app.post('/predict')
def read_items():
    dataframes = []

    for file in csv_files:
        file_path = os.path.join(folder_path, file)
        df = pd.read_csv(file_path, low_memory=False)
        df.columns = orig_column_list
        dataframes.append(df)

    # Concatenate all DataFrames in the list
    data = pd.concat(dataframes, ignore_index=True)

    # Drop the first four columns
    data = data.iloc[:, 4:]
    data['Timestamp'] = pd.to_datetime(data['Timestamp'], format="%d/%m/%Y %H:%M:%S %p")
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
    
    # PCA aplly
    X_new = pca.transform(X_new)
# Make predictions using the loaded model
    y_pred = loaded_model.predict(X_new)

# Convert the one-hot encoded predicted labels back to their original form

    y_pred_labels = y_pred.tolist()
    y_pred_labels = np.argmax(y_pred, axis=1)
    """
    y_pred_labels_num = []
    for item in y_pred_labels:
        max = 0
        for i in range(0,len(item)):
            if(item[i] > item[max]):
                max = i
        y_pred_labels_num.append(str(i))
    """

    y_pred_labels = ["".join(str(item)) for item in y_pred_labels]
    


    #print(y_pred_labels)
    return {"predictions" : str(y_pred_labels)}
