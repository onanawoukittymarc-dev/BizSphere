// app/+not-found.tsx
import { useRouter } from 'expo-router';
import { SafeAreaView, StyleSheet } from 'react-native';
import { StateView } from '../components/StateView';
import { Colors } from '../constants/theme';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StateView
        icon="alert-circle-outline"
        title="Page introuvable"
        description="Cet écran n'existe pas ou a été déplacé."
        actionLabel="Retour aux discussions"
        onAction={() => router.replace('/')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.base,
    justifyContent: 'center',
  },
});