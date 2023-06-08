import pickle
import tensorflow as tf
from tensorflow import keras

# Load the Keras model from an h5 file
keras_model = keras.models.load_model("CIC2018_425_SMOTE.h5")
tf.saved_model.save(keras_model, "/home/yunmo/Documents/gwangjin_ninja/model/CIC2018_425_SMOTE")

