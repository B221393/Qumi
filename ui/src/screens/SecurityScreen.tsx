import React, { useState } from 'react';
import {
  StyleSheet, Text, View, Dimensions, Switch, TouchableOpacity, ScrollView, Alert, Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Lock, Fingerprint, Trash2, Eye, EyeOff, Database, FileX } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInDown, useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// ─── アニメーション付きトグル行 ───────────────────────────────────────────────
const PrivacyToggleRow = ({
  icon: Icon, color, title, desc, enabled, onToggle
}: {
  icon: any; color: string; title: string; desc: string; enabled: boolean; onToggle: (v: boolean) => void;
}) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.settingItem, animStyle]}>
      <View style={[styles.iconCircleSmall, { backgroundColor: `${color}22` }]}>
        <Icon color={color} size={20} />
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDesc}>{desc}</Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={(v) => {
          scale.value = withSequence(
            withSpring(0.93, { damping: 12 }),
            withSpring(1, { damping: 12 })
          );
          onToggle(v);
        }}
        trackColor={{ false: '#333', true: `${color}88` }}
        thumbColor={enabled ? color : '#888'}
        ios_backgroundColor="#222"
      />
    </Animated.View>
  );
};

// ─── データ削除ボタン行 ────────────────────────────────────────────────────────
const DataClearRow = ({ title, desc, onClear }: { title: string; desc: string; onClear: () => void }) => (
  <View style={styles.settingItem}>
    <View style={[styles.iconCircleSmall, { backgroundColor: 'rgba(255, 51, 102, 0.12)' }]}>
      <Trash2 color="#FF3366" size={20} />
    </View>
    <View style={styles.settingTextContainer}>
      <Text style={styles.settingTitle}>{title}</Text>
      <Text style={styles.settingDesc}>{desc}</Text>
    </View>
    <TouchableOpacity style={styles.clearButton} onPress={onClear} activeOpacity={0.7}>
      <Text style={styles.clearButtonText}>消去</Text>
    </TouchableOpacity>
  </View>
);

export default function SecurityScreen() {
  // ─── 個人情報保護トグルの状態 ────────────────────────────────────────────────
  const [logMaskEnabled, setLogMaskEnabled] = useState(true);
  const [sanitizeEnabled, setSanitizeEnabled] = useState(true);
  const [localOnlyEnabled, setLocalOnlyEnabled] = useState(true);
  const [faceAuthEnabled, setFaceAuthEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  const handleClear = (label: string) => {
    // TODO: integrate with actual AsyncStorage / local DB to persist deletion
    if (Platform.OS === 'web') {
      if (window.confirm(`「${label}」のデータをすべて消去しますか？\nこの操作は元に戻せません。`)) {
        Alert.alert('✅ 消去完了', `${label} のローカルデータを消去しました。`);
      }
    } else {
      Alert.alert(
        '⚠️ データ消去',
        `「${label}」のデータをすべて消去しますか？\nこの操作は元に戻せません。`,
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: '消去する', style: 'destructive',
            onPress: () => Alert.alert('✅ 消去完了', `${label} のローカルデータを消去しました。`)
          }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.bgGlow} />
      <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFillObject} />

      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>

        {/* ヘッダー */}
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
          <LinearGradient colors={['#FF3366', '#A020F0']} style={styles.iconCircle}>
            <Shield color="#FFF" size={32} />
          </LinearGradient>
          <Text style={styles.title}>SECURITY</Text>
          <Text style={styles.subtitle}>個人情報保護・外部脳データ管理</Text>
        </Animated.View>

        {/* セクション1：暗号化 & 認証ステータス */}
        <Animated.View entering={FadeInUp.delay(150).springify()}>
          <Text style={styles.sectionLabel}>🔒 VAULT STATUS</Text>
          <BlurView intensity={60} tint="dark" style={styles.card}>
            <View style={styles.statusRow}>
              <Lock color="#FF3366" size={20} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Local Vector Vault</Text>
                <Text style={styles.settingDesc}>AES-256 Encrypted · ローカル限定保存</Text>
              </View>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>SECURE</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.statusRow}>
              <Fingerprint color="#FF3366" size={20} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Identity Auth</Text>
                <Text style={styles.settingDesc}>Face / Touch Authentication</Text>
              </View>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>ACTIVE</Text>
              </View>
            </View>
          </BlurView>
        </Animated.View>

        {/* セクション2：個人情報保護トグル */}
        <Animated.View entering={FadeInUp.delay(250).springify()} style={styles.section}>
          <Text style={styles.sectionLabel}>🛡️ PRIVACY CONTROLS</Text>
          <BlurView intensity={60} tint="dark" style={styles.card}>
            <PrivacyToggleRow
              icon={EyeOff}
              color="#FF3366"
              title="ログのマスキング"
              desc="日記・メモ内の固有名詞を自動でマスク表示"
              enabled={logMaskEnabled}
              onToggle={setLogMaskEnabled}
            />
            <View style={styles.divider} />
            <PrivacyToggleRow
              icon={FileX}
              color="#A020F0"
              title="公開前サニタイズ"
              desc="外部共有時に個人情報を自動除去する"
              enabled={sanitizeEnabled}
              onToggle={setSanitizeEnabled}
            />
            <View style={styles.divider} />
            <PrivacyToggleRow
              icon={Database}
              color="#00D4FF"
              title="ローカル限定モード"
              desc="すべてのデータをデバイス内にのみ保持"
              enabled={localOnlyEnabled}
              onToggle={setLocalOnlyEnabled}
            />
            <View style={styles.divider} />
            <PrivacyToggleRow
              icon={Lock}
              color="#00FF99"
              title="顔認証ロック"
              desc="起動時に生体認証を要求する"
              enabled={faceAuthEnabled}
              onToggle={setFaceAuthEnabled}
            />
            <View style={styles.divider} />
            <PrivacyToggleRow
              icon={Eye}
              color="#FFAE00"
              title="利用分析の送信"
              desc="匿名の使用状況データを開発者に送信する"
              enabled={analyticsEnabled}
              onToggle={setAnalyticsEnabled}
            />
          </BlurView>
        </Animated.View>

        {/* セクション3：データ管理（消去） */}
        <Animated.View entering={FadeInUp.delay(350).springify()} style={styles.section}>
          <Text style={styles.sectionLabel}>🗑️ DATA MANAGEMENT</Text>
          <BlurView intensity={60} tint="dark" style={styles.card}>
            <DataClearRow
              title="AI Memo データ消去"
              desc="外部脳に委譲した思考ログをすべて削除"
              onClear={() => handleClear('AI Memo')}
            />
            <View style={styles.divider} />
            <DataClearRow
              title="Daily Log データ消去"
              desc="日次の活動・思考ログをすべて削除"
              onClear={() => handleClear('Daily Log')}
            />
            <View style={styles.divider} />
            <DataClearRow
              title="Novel Studio データ消去"
              desc="執筆中の草稿・物語データをすべて削除"
              onClear={() => handleClear('Novel Studio')}
            />
            <View style={styles.divider} />
            <DataClearRow
              title="全データ初期化"
              desc="すべての外部脳データをリセットして工場出荷状態に戻す"
              onClear={() => handleClear('すべてのデータ')}
            />
          </BlurView>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  bgGlow: {
    position: 'absolute', top: 150, left: 0,
    width: width * 0.9, height: width * 0.9, borderRadius: width,
    backgroundColor: '#FF3366', opacity: 0.15, filter: 'blur(90px)' as any
  },
  inner: { paddingTop: 100, paddingHorizontal: 20, paddingBottom: 150 },

  header: { alignItems: 'center', marginBottom: 40 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#FF3366', shadowOpacity: 0.8, shadowRadius: 20
  },
  title: {
    color: '#FFF', fontSize: 28, fontWeight: '900',
    fontFamily: 'Outfit_900Black', marginTop: 24, letterSpacing: 2
  },
  subtitle: {
    color: '#FF3366', fontSize: 13,
    fontFamily: 'Outfit_700Bold', marginTop: 6, letterSpacing: 1
  },

  sectionLabel: {
    color: '#888', fontSize: 11, fontFamily: 'Outfit_700Bold',
    letterSpacing: 2, marginBottom: 10, marginLeft: 4
  },
  section: { marginTop: 28 },
  card: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 51, 102, 0.15)' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 20 },

  statusRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 18, gap: 14
  },
  settingItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 16, gap: 14
  },
  iconCircleSmall: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center'
  },
  settingTextContainer: { flex: 1 },
  settingTitle: { color: '#FFF', fontSize: 15, fontFamily: 'Outfit_700Bold', marginBottom: 3 },
  settingDesc: { color: '#888', fontSize: 12, fontFamily: 'Outfit_400Regular', lineHeight: 17 },

  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 153, 0.12)',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 5
  },
  statusDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#00FF99',
    shadowColor: '#00FF99', shadowOpacity: 1, shadowRadius: 4
  },
  statusText: { color: '#00FF99', fontSize: 10, fontFamily: 'Outfit_700Bold', letterSpacing: 1 },

  clearButton: {
    backgroundColor: 'rgba(255, 51, 102, 0.15)',
    borderWidth: 1, borderColor: 'rgba(255, 51, 102, 0.4)',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12
  },
  clearButtonText: { color: '#FF3366', fontSize: 12, fontFamily: 'Outfit_700Bold' },
});

