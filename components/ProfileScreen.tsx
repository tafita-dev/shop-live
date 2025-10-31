import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, MaterialIcons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import uploadImageToCloudinary from '@/app/api/uploadFile';
import Spinner from 'react-native-loading-spinner-overlay';
import { UserClass } from '@/users/user';
import { authStorage } from '@/utils/authStorage';

interface ProfileScreenProps {
  onEdit?: () => void;
  name?: string;
  image?: string;
  email?: string;
  birthday?: string;
  phone?: string;
}

export default function ProfileScreen({
  onEdit,
  name = 'Anna Avetisyan',
  email = 'info@aplusdesign.co',
  birthday = 'Birthday',
  phone = '818 123 4567',
  image,
}: ProfileScreenProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'geo'>('info');
  const [profileImage, setProfileImage] = useState(image);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      setLoading(true);
      const uid = await authStorage.getUserId();
      const resultUpload = await uploadImageToCloudinary(result.assets[0].uri);

      if (resultUpload && uid) {
        const isupate = await UserClass.UpdateProfile(resultUpload, uid);
        console.log(resultUpload, 'hjgjhhh', uid, isupate);
        setLoading(false);
        setProfileImage(result.assets[0].uri);
        setModalVisible(false);
      } else {
        setLoading(false);
      }
    }
  };

  const takePhotoWithCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      setLoading(true);
      const uid = await authStorage.getUserId();
      const resultUpload = await uploadImageToCloudinary(result.assets[0].uri);
      console.log(resultUpload, 'hjgjhhh');

      if (resultUpload && uid) {
        const isupate = await UserClass.UpdateProfile(resultUpload, uid);
        console.log(resultUpload, 'hjgjhhh', uid, isupate);

        setLoading(false);
        setProfileImage(result.assets[0].uri);
        setModalVisible(false);
      } else {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs en haut */}
      <Spinner
        visible={loading}
        textContent={'Chargement photo de profile...'}
        textStyle={{ color: '#fff' }}
        overlayColor="rgba(0, 0, 0, 0.7)"
      />

      <LinearGradient colors={['#fff', '#f9f9f9']} style={styles.bottomTabs}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'info' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('info')}
        >
          <FontAwesome
            name="user"
            size={22}
            color={activeTab === 'info' ? '#EC4899' : '#9e9e9e'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'info' && styles.tabTextActive,
            ]}
          >
            Information
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'geo' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('geo')}
        >
          <Feather
            name="map-pin"
            size={22}
            color={activeTab === 'geo' ? '#EC4899' : '#9e9e9e'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'geo' && styles.tabTextActive,
            ]}
          >
            Géolocalisation
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {activeTab === 'info' ? (
          <>
            <LinearGradient colors={['#fff', '#fff']} style={styles.header}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{
                    uri: profileImage
                      ? profileImage
                      : 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                  }}
                  style={styles.avatar}
                />
                <TouchableOpacity
                  style={styles.cameraIcon}
                  onPress={() => setModalVisible(true)}
                >
                  <FontAwesome name="camera" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <Text style={styles.name}>{name}</Text>
            </LinearGradient>

            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <MaterialIcons name="cake" size={22} color="#EC4899" />
                <Text style={styles.infoText}>{birthday}</Text>
              </View>

              <View style={styles.infoRow}>
                <Feather name="phone" size={22} color="#EC4899" />
                <Text style={styles.infoText}>{phone}</Text>
              </View>

              <View style={styles.infoRow}>
                <MaterialIcons name="email" size={22} color="#EC4899" />
                <Text style={styles.infoText}>{email}</Text>
              </View>

              <View style={styles.infoRow}>
                <Feather name="lock" size={22} color="#EC4899" />
                <Text style={styles.infoText}>Password</Text>
              </View>

              <TouchableOpacity
                onPress={onEdit}
                style={styles.editButtonWrapper}
              >
                <LinearGradient
                  colors={['#EC4899', '#EC4899']}
                  style={styles.editButton}
                >
                  <Text style={styles.editButtonText}>Edit Profile</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.geoContainer}>
            <Text style={styles.geoTitle}>📍 Position géographique</Text>
            <Text style={styles.geoText}>
              Latitude: -18.8792{'\n'}Longitude: 47.5079{'\n'}(Antananarivo,
              Madagascar)
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal pour prendre ou importer une photo */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={takePhotoWithCamera}
            >
              <Text style={styles.modalText}>Prendre une photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={pickImageFromGallery}
            >
              <Text style={styles.modalText}>Importer depuis la galerie</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalOption, styles.modalCancel]}
              onPress={() => setModalVisible(false)}
            >
              <Text
                style={[
                  styles.modalText,
                  { color: '#EC4899', fontWeight: '700' },
                ]}
              >
                Annuler
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  avatarWrapper: {
    position: 'relative',
    width: 150,
    height: 150,
    marginBottom: 10,
    alignSelf: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    backgroundColor: '#fff',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#EC4899',
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  header: { alignItems: 'center', paddingTop: 20 },
  name: { color: '#EC4899', fontSize: 20, fontWeight: '600' },
  infoContainer: { marginTop: 30, paddingHorizontal: 30 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  infoText: { marginLeft: 15, fontSize: 15, color: '#333' },
  editButtonWrapper: { alignItems: 'center', marginTop: 20, marginBottom: 80 },
  editButton: {
    width: '80%',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  editButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  geoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  geoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EC4899',
    marginBottom: 10,
  },
  geoText: { fontSize: 15, color: '#333', textAlign: 'center', lineHeight: 22 },
  bottomTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
    elevation: 8,
  },
  tabButton: { alignItems: 'center', justifyContent: 'center' },
  tabButtonActive: { transform: [{ scale: 1.05 }] },
  tabText: { fontSize: 13, color: '#9e9e9e', marginTop: 2 },
  tabTextActive: { color: '#EC4899', fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalOption: {
    padding: 18,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
  },
  modalText: { fontSize: 16 },
  modalCancel: { borderBottomWidth: 0 },
});
